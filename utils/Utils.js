import React from 'react';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import FileSaver from 'file-saver';
import moment from 'moment';
import AnalyticsUtil from './AnalyticsUtil';
import InstagramApi from './InstagramApi';
import XLinkController from "../node_modules/dashjs/src/streaming/controllers/XlinkController.js";
import ErrorHandler from "../node_modules/dashjs/src/streaming/utils/ErrorHandler.js";
import DashParser from "../node_modules/dashjs/src/dash/parser/DashParser.js";

// returns the "slide" object the StoryGallery in the Story component uses
export function getStorySlide(story, callback) {
  var items = (story.reel) ? story.reel.items : story.items;
  const storyMedia = items.map((media, key) => {
    const url = getMediaItemUrl(media);
    return {
      id: media.id,
      index: key,
      original: url
    };
  });
  
  var storySlide = {
    key: (story.reel) ? story.reel.id : story.id,
    media: storyMedia,
    story: story
  };
  
  if(callback) {
    callback(storySlide);
  }
  return storySlide;
}

// returns the correct "user" object from a story API response
export function getUserFromStoryResponse(storyResponse) {
  var user;
  if(storyResponse.reel && storyResponse.reel !== null) {
    user = storyResponse.reel.user;
  } else if(storyResponse.post_live_item) {
    user = storyResponse.post_live_item.user;
  } else if(storyResponse.broadcast) {
    user = storyResponse.broadcast.broadcast_owner;
  }
  return user;
}

// fetches the appropriate story and returns it (or downloads if shouldDownload is true)
export function fetchStory(selectedStory, shouldDownload, callback) {
  if(selectedStory.location) {
    InstagramApi.getLocationStory(selectedStory.location.pk, (story) => {
      if(story) {
        if(shouldDownload) {
          downloadStory(story, () => callback(true));
        } else {
          callback(story)
        }
      } else {
        callback(null);
      }
    });
  } else if(selectedStory.name) {
    InstagramApi.getHashtagStory(selectedStory.name, (story) => {
      if(story) {
        if(shouldDownload) {
          downloadStory(story, () => callback(true));
        } else {
          callback(story)
        }
      } else {
        callback(null);
      }
    });
  } else {
    InstagramApi.getStory(selectedStory.id, (story) => {
      if(story && story.reel !== null && story.reel.items.length > 0) {
        if(shouldDownload) {
          downloadStory(story, () => callback(true));
        } else {
          callback(story)
        }
      } else {
        callback(null);
      }
    });
  }
}

// opens a new window with the correct URL for the story author's page
export function onStoryAuthorUsernameClicked(storyItem) {
  if(storyItem.user || storyItem.broadcast_owner) {
    const user = (storyItem.user) ? storyItem.user : storyItem.broadcast_owner;
    window.open('https://www.instagram.com/' + user.username + '/');
  } else {
    const owner = storyItem.owner;
    if(owner.type === 'location') {
      window.open('https://www.instagram.com/explore/locations/' + owner.pk + '/');
    } else if (owner.type === 'tag') {
      window.open('https://www.instagram.com/explore/tags/' + owner.pk + '/');
    }
  }
}

// given a username, fetches and downloads the user's story after retrieving the user's ID
export function downloadStoryByUsername(username, callback) {
  InstagramApi.getUserByUsername(username).then(function(user) {
    fetchStory({id: user.user.id}, true, () => {
      if(callback) {
        callback();
      }
    });
  });
}

// downloads a zip file containing the user's Story
export function downloadStory(trayItem, callback) {
  var zip = new JSZip();
  var items = (trayItem.reel) ? trayItem.reel.items : trayItem.items;
  items.map((storyItem, i) => {
    var mediaItemUrl = getMediaItemUrl(storyItem);
    // downloads each Story image/video and adds it to the zip file
    zip.file(getStoryFileName(storyItem, mediaItemUrl), urlToPromise(mediaItemUrl), {binary:true});
  });
  // generate zip file and start download
  zip.generateAsync({type:"blob"})
  .then(function(content) {
    FileSaver.saveAs(content, getZipFileName(trayItem));
    AnalyticsUtil.track("Download Story", AnalyticsUtil.getStoryObject(trayItem));
    if(callback) {
      callback();
    }
  });
}

// promises to download the file before zipping it
function urlToPromise(url) {
  return new Promise(function(resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if(err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// returns the name of the zip file to download with format: (username-timestamp.zip)
function getZipFileName(trayItem) {
  var user, name;
  if(trayItem.reel) {
    user = trayItem.reel.user;
  } else {
    user = (trayItem.user) ? trayItem.user : trayItem.owner;
  }
  name = (user.username) ? user.username : user.name;
  return name + "-" + moment().format() + ".zip";
}

// returns the name of the image/video file to add to the zip file
function getStoryFileName(storyItem, mediaItemUrl) {
  return storyItem['id'] + (((mediaItemUrl.includes(".mp4")) ? ".mp4" : ".jpg"));
}

export function renderToolbar(additionalGroup) {
  const styles = {
    toolbar: {
      backgroundColor: 'white',
      boxShadow: '0 5px 5px -5px rgba(0, 0, 0, 0.118), 5px 0 5px -5px rgba(0, 0, 0, 0.118), -5px 0 5px -5px rgba(0, 0, 0, 0.118)',
      flexDirection: 'row'
    },
    toolbarAvatar: {
      backgroundColor: 'transparent',
      borderRadius: '0px',
      marginLeft: '15px'
    },
    toolbarListItem: {
      paddingLeft: '10px',
      paddingTop: '15px',
    },
    toolbarSecondaryText: {
      fontSize: '14px',
      marginTop: '4px',
      color: '#0000008a',
      cursor: 'pointer'
    }
  }
  return (
    <Toolbar
      style={styles.toolbar}>
      <ToolbarGroup firstChild={true} style={{flexDirection: 'row'}}>
        <Avatar
          src={chrome.extension.getURL('img/icon-128.png')}
          style={styles.toolbarAvatar}
          />
        <ListItem
          primaryText={<div style={{cursor: 'pointer'}} onClick={()=> window.open('https://github.com/CaliAlec/ChromeIGStory')}>Chrome IG Story</div>}
          secondaryText={<div style={styles.toolbarSecondaryText} onClick={()=> window.open('http://alecgarcia.me/')}>by Alec Garcia</div>}
          style={styles.toolbarListItem}
          disabled={true}
          />
      </ToolbarGroup>
      {additionalGroup}
    </Toolbar>
  );
}

function renderStoryVideoItem(item) {
  return (
    <div>
      <video
        className="story-media-item"
        id={item.id}
        src={item.original}
        preload="metadata"
        />
    </div>
  )
}

function renderStoryImage(item) {
  return (
    <div>
      <img
        className="story-media-item"
        src={item.original}
        />
    </div>
  )
}

export function toggleAnonymousStoryViews(callback) {
  chrome.storage.local.get("viewStoriesAnonymously", function(items) {
    var viewStoriesAnonymously = (items.viewStoriesAnonymously) ? false : true;
    setStorageItem("viewStoriesAnonymously", viewStoriesAnonymously);
    callback(viewStoriesAnonymously);
  }.bind(this));
}

export function setStorageItem(key, value, callback) {
  chrome.storage.local.set({[key]: value}, function() {
    if(callback) {
      callback();
    }
  });
}

// returns a parsed manifest object from a dash manifest string representation
export function getLiveVideoManifestObject(manifest) {
  const parser = DashParser().create({errorHandler: ErrorHandler().getInstance()});
  const xlink = XLinkController().create({});
  var mpd = parser.parse(manifest, xlink);
  mpd.loadedTime = new Date();
  xlink.resolveManifestOnLoad(mpd);
  return mpd;
}

// returns the URL of an audio mp4 file for a post-live video
export function getLiveVideoMp4AudioUrl(manifest, callback) {
  var manifestObject = getLiveVideoManifestObject(manifest);
  var adaptationSet = manifestObject.Period_asArray[0].AdaptationSet_asArray;
  adaptationSet.forEach(function (adaptation) {
    var representation = adaptation.Representation;
    if(representation.mimeType === 'audio/mp4') {
      callback(representation.BaseURL);
    }
  });  
}

// returns the URL of a video mp4 file for a post-live video
export function getLiveVideoMp4VideoUrl(manifest, callback) {
  var manifestObject = getLiveVideoManifestObject(manifest);
  var adaptationSet = manifestObject.Period_asArray[0].AdaptationSet_asArray;
  adaptationSet.forEach(function (adaptation) {
    var representation = adaptation.Representation;
    if(representation.mimeType === 'video/mp4') {
      callback(representation.BaseURL);
    }
  });
}

// returns an optimized URL format for the image/video
export function getMediaItemUrl(storyItem) {
  var mediaItem;
  if(storyItem['video_versions']) {
    mediaItem = storyItem['video_versions'][0];
  } else {
    mediaItem = storyItem['image_versions2']['candidates'][0];
  }
  var secureUrl = mediaItem['url'].replace("http://", "https://");
  return secureUrl;
}


// returns a thumbnail image for a story
export function getStoryCoverImage(storyItem) {
  var mediaItem = storyItem['image_versions2']['candidates'][0];
  var secureUrl = mediaItem['url'].replace("http://", "https://");
  return secureUrl;
}

// extracts and returns the id for the live video because the id on the object itself is sometimes wrong
export function getLiveVideoId(liveVideoItem) {
  var playbackUrl = liveVideoItem.dash_playback_url;
  var link = playbackUrl.split(".mpd")[0];
  return link.split("dash-hd/")[1];
}

export function getTimeElapsed(timestamp) {
  return moment.unix(timestamp).fromNow();
}

export function isVideo(url) {
  return url.indexOf('.mp4') > -1;
}
