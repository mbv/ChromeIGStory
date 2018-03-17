import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {Store} from 'react-chrome-redux';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Raven from 'raven-js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import StoriesTray from './components/app/StoriesTray';
import HighlightsTray from './components/app/HighlightsTray';
import App from './components/app/App';
import UserProfileStoryItem from './components/app/profile/UserProfileStoryItem';
import ViewLiveButton from './components/app/profile/ViewLiveButton';
import LocationStoryItem from './components/app/LocationStoryItem';
import HashtagStoryItem from './components/app/HashtagStoryItem';
import InstagramApi from '../../../utils/InstagramApi';
import {getTimeElapsed, getStorySlide, getLiveVideoManifestObject} from '../../../utils/Utils';
import { MediaPlayer } from 'dashjs';
import moment from 'moment';
import $ from 'jquery';

import {
  INSTAGRAM_MAIN_CONTAINER_CLASS_NAME,
  INSTAGRAM_FEED_CONTAINER_CLASS_NAME,
  INSTAGRAM_FEED_CLASS_NAME,
  INSTAGRAM_LOCATION_FEED_CLASS_NAME,
  INSTAGRAM_HASHTAG_FEED_CLASS_NAME,
  INSTAGRAM_HASHTAG_NAME_CLASS_NAME,
  INSTAGRAM_USER_IMAGE_CONTAINER_HOLDER_CLASS_NAME,
  INSTAGRAM_USER_IMAGE_CONTAINER_CLASS_NAME,
  INSTAGRAM_USER_IMAGE_CLASS_NAME,
  INSTAGRAM_USER_USERNAME_CLASS_NAME,
  INSTAGRAM_NATIVE_STORIES_CONTAINER_CLASS_NAME,
  INSTAGRAM_NATIVE_STORIES_LIST_CONTAINER_CLASS_NAME,
  SENTRY_TOKEN,
  muiTheme
} from '../../../utils/Constants';

var instagramFeed, instagramFeedContainer, instagramLocationFeed,
instagramHashtagFeed, instagramHashtagName, instagramUserImage, instagramUserUsername,
instagramNativeStoriesContainer, storiesListContainer;
export const proxyStore = new Store({portName: 'chrome-ig-story'});

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

if(SENTRY_TOKEN !== null) {
  Raven.config(SENTRY_TOKEN).install();
  window.addEventListener('unhandledrejection', event => {
    Raven.captureException(event.reason);
  });
}

// ** MAIN ENTRY POINT ** //
loadStories();

// tell background.js to load cookies so we can check if they are available before we make requests
function loadStories() {
  chrome.runtime.sendMessage('loadStories');
}

// listen for background.js to send over cookies so we are clear to make requests
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  var instagramCookies = JSON.parse(request.instagramCookies);    
  injectContentScript();
});

// determine the proper element that exists on the page and inject the corresponding data for it
function injectContentScript() {
  instagramFeedContainer = document.getElementsByClassName(INSTAGRAM_FEED_CONTAINER_CLASS_NAME)[0];
  instagramFeed = document.getElementsByClassName(INSTAGRAM_FEED_CLASS_NAME)[0];
  instagramLocationFeed = document.getElementsByClassName(INSTAGRAM_LOCATION_FEED_CLASS_NAME)[0];
  instagramHashtagFeed = document.getElementsByClassName(INSTAGRAM_HASHTAG_FEED_CLASS_NAME)[0];
  instagramHashtagName = document.getElementsByClassName(INSTAGRAM_HASHTAG_NAME_CLASS_NAME)[0];
  instagramUserImage = document.getElementsByClassName(INSTAGRAM_USER_IMAGE_CLASS_NAME)[0];
  instagramUserUsername = document.getElementsByClassName(INSTAGRAM_USER_USERNAME_CLASS_NAME)[0];
  instagramNativeStoriesContainer = document.getElementsByClassName(INSTAGRAM_NATIVE_STORIES_CONTAINER_CLASS_NAME)[0];
    
  if (instagramUserUsername) {
    getUserStory();
  } else if(instagramLocationFeed) {
    var url = window.location.href;
    var matchGroup = url.match(/([\d]+)/g);
    if(matchGroup[0]) {
      var locationId = matchGroup[0];
      getLocationStory(locationId);
    }
  } else if(instagramHashtagFeed) {
    var hashtag = instagramHashtagName.innerText;
    hashtag = hashtag.replace('#', '');
    getHashtagStory(hashtag);
  } else {
    if(!document.getElementById("storiesListContainer")) {
      if(instagramNativeStoriesContainer) {
        $(instagramNativeStoriesContainer).remove();
        injectFriendStories();
      }
    }
  }
}

// fetch user's Story and inject it into their profile page if it's available
function getUserStory() {
  var username = instagramUserUsername.innerText;
  InstagramApi.searchForUser(username, (users) => {
    var user =  users.find(function(user) {
      return user.username === username;
    });
    InstagramApi.getStory(user.pk, (story) => {
      if(story.reel !== null || story.broadcast || story.post_live_item) {
        injectUserStory(instagramUserImage, story);
      }
    });
    InstagramApi.getHighlights(user.pk, (highlights) => {
      if(highlights.tray && highlights.tray.length > 0) {
        injectUserStoryHighlights(highlights.tray);
      }
    });
  });
}

// fetch location's Story and inject it into its feed page if it's available
function getLocationStory(locationId) {
  InstagramApi.getLocationStory(locationId, (story) => {
    if(story) {
      injectLocationStory(story);
    }
  });
}

// fetch hashtag's Story and inject it into its feed page if it's available
function getHashtagStory(hashtag) {
  InstagramApi.getHashtagStory(hashtag, (story) => {
    if(story) {
      injectHashtagStory(story);
    }
  });
}

// inject the user's friends' story tray in the homepage above the main feed on Instagram.com
function injectFriendStories() {
  // renderStoriesList();
  renderStoryTray();
  InstagramApi.getFriendStories((friendStoriesResponse) => {
    proxyStore.dispatch({
      type: 'SET_FRIEND_STORIES',
      friendStories: friendStoriesResponse
    });
  });
  InstagramApi.getExploreFeed((exploreStoriesResponse) => {
    proxyStore.dispatch({
      type: 'SET_EXPLORE_STORIES',
      exploreStories: InstagramApi.getExploreStories(exploreStoriesResponse)
    });
  });
  InstagramApi.getTopLiveVideos((topLiveVideosResponse) => {
    proxyStore.dispatch({
      type: 'SET_TOP_LIVE_VIDEOS',
      topLiveVideos: topLiveVideosResponse.broadcasts
    });
  });
}

// inject the story for a particular user while on their profile page e.g. Instagram.com/username
function injectUserStory(instagramUserImage, story) {
  var container = document.getElementsByClassName(INSTAGRAM_USER_IMAGE_CONTAINER_HOLDER_CLASS_NAME)[0];
  
  if(story.post_live_item) {
    renderViewLiveReplayButton(story);
  }
  if(story.broadcast) {
    renderViewLiveButton(story);
  }
  if(story.reel) {
    var storyUserImageClickJacker = document.createElement('div');
    
    var userProfileStoryItem = (
      <UserProfileStoryItem storyItem={story}/>
    );
    
    container.insertBefore(storyUserImageClickJacker, container.childNodes[0]);
    
    renderStoryItem(userProfileStoryItem, storyUserImageClickJacker);
  }
}

// inject the story highlights for a particular user while on their profile page e.g. Instagram.com/username
function injectUserStoryHighlights(highlightItems) {
  if(!document.getElementById("story-highlights")) {
    const anchor = document.createElement('div');
    anchor.id = 'story-highlights';
    var instagramFeed = document.getElementsByClassName(INSTAGRAM_NATIVE_STORIES_LIST_CONTAINER_CLASS_NAME)[0];
    instagramFeed.insertBefore(anchor, instagramFeed.childNodes[0]);
    
    var storyHighlightsTrayComponent = (
      <HighlightsTray highlightItems={highlightItems}/>
    );
    renderStoryItem(storyHighlightsTrayComponent, anchor);
  }
}

// inject the story for a particular location while on its feed page e.g. Instagram.com/explore/locations/locationId
function injectLocationStory(story) {
  const locationStoryIconContainer = document.createElement('div');
  locationStoryIconContainer.id = "locationStoryIconContainer";
  instagramLocationFeed.insertBefore(locationStoryIconContainer, instagramLocationFeed.childNodes[0]);
  var container = document.getElementById("locationStoryIconContainer");
  var storyItemComponent = (
    <LocationStoryItem storyItem={story}/>
  );
  renderStoryItem(storyItemComponent, container);
}

// inject the story for a particular hashtag while on its feed page e.g. Instagram.com/explore/tags/hashtagName
function injectHashtagStory(story) {
  const hashtagStoryIconContainer = document.createElement('div');
  hashtagStoryIconContainer.id = "hashtagStoryIconContainer";
  instagramHashtagFeed.insertBefore(hashtagStoryIconContainer, instagramHashtagFeed.childNodes[0]);
  var container = document.getElementById("hashtagStoryIconContainer");
  var storyItemComponent = (
    <HashtagStoryItem storyItem={story}/>
  );
  
  renderStoryItem(storyItemComponent, container);
}

function renderViewLiveButton(story) {
  var container = document.getElementsByClassName(INSTAGRAM_USER_IMAGE_CONTAINER_HOLDER_CLASS_NAME)[0];
  var viewLiveButtonContainer = document.createElement('div');
  viewLiveButtonContainer.id = "viewLiveButtonContainer";
  if(!document.getElementById("viewLiveButtonContainer")) {
    container.appendChild(viewLiveButtonContainer);
    var viewLiveButtonComponent = (
      <ViewLiveButton storyItem={story}/>
    );
    renderStoryItem(viewLiveButtonComponent, viewLiveButtonContainer);
  }
}

function renderViewLiveReplayButton(story) {
  var container = document.getElementsByClassName(INSTAGRAM_USER_IMAGE_CONTAINER_HOLDER_CLASS_NAME)[0];
  var viewLiveReplayButtonContainer = document.createElement('div');
  viewLiveReplayButtonContainer.id = "viewLiveReplayButtonContainer";
  if(!document.getElementById("viewLiveReplayButtonContainer")) {
    container.appendChild(viewLiveReplayButtonContainer);
    var viewLiveReplayButtonComponent = (
      <ViewLiveButton isLiveReplay storyItem={story}/>
    );
    renderStoryItem(viewLiveReplayButtonComponent, viewLiveReplayButtonContainer);
  }
}

function renderStoryItem(storyItemComponent, container) {
  render(
    <Provider store={proxyStore}>
      <MuiThemeProvider muiTheme={muiTheme}>
        {storyItemComponent}
      </MuiThemeProvider>  
    </Provider>, container
  );
}

function renderStoriesList() {
  // wait for the store to connect to the background page
  proxyStore.ready().then(() => {
    render(
      <Provider store={proxyStore}>
        <MuiThemeProvider muiTheme={muiTheme}>
          <App/>
        </MuiThemeProvider>  
      </Provider>
      , storiesListContainer);
    });  
  }
  
  // render the story tray above the Instagram feed
  function renderStoryTray() {
    const anchor = document.createElement('div');
    anchor.id = 'rcr-anchor';
    if(!document.getElementById("rcr-anchor")) {
      
      if(!instagramNativeStoriesContainer) {
        instagramFeed = document.getElementsByClassName(INSTAGRAM_NATIVE_STORIES_LIST_CONTAINER_CLASS_NAME)[0];
      }
      
      instagramFeed.insertBefore(anchor, instagramFeed.childNodes[0]);
      if(instagramFeedContainer) {
        instagramFeedContainer.style.maxWidth = '600px';
      }
      
      // wait for the store to connect to the background page
      proxyStore.ready().then(() => {
        render(
          <Provider store={proxyStore}>
            <MuiThemeProvider muiTheme={muiTheme}>
              <StoriesTray/>
            </MuiThemeProvider>  
          </Provider>
          , document.getElementById('rcr-anchor'));
        });  
      }
    }