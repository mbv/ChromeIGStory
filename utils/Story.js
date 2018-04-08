import React, { Component } from 'react';
import {connect} from 'react-redux';
import StoryGallery from 'react-image-gallery';
import StoryProgress from './StoryProgress';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import LinkIcon from 'material-ui/svg-icons/content/link';
import {isVideo, getTimeElapsed} from './Utils';
import InstagramApi from './InstagramApi';
import AnalyticsUtil from './AnalyticsUtil';

import {
  TAB_TEXT_COLOR_LIGHT_GRAY
} from './Constants';

class Story extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVideoPlaying: false,
      currentStoryItem: this.getInitialStoryItem(this.props.item),
      currentIndex: 0,
    };
  }
  
  componentDidMount() {
    this.setStorySeen();
  }
  
  componentWillReceiveProps = (nextProps) => {
    if(nextProps.item.key !== this.props.item.key) {
      this._imageGallery.slideToIndex(0);
      this.setState({
        currentIndex: 0,
        currentStoryItem: this.getInitialStoryItem(nextProps.item)
      });
    }
  }

  getInitialStoryItem(item) {
    return (item.story.reel) ? item.story.reel.items[0] : item.story.items[0]
  }
  
  getCurrentStoryItem() {
    var storyItems = (this.props.item.story.reel) ? this.props.item.story.reel.items : this.props.item.story.items;
    return storyItems[this._imageGallery.getCurrentIndex()];
  }
  
  onSlide(currentIndex) {
    if(this.state.currentIndex >= 0) {
      var previousMedia = this.props.item.media[this.state.currentIndex];
      if(previousMedia && isVideo(previousMedia.original)) {
        var video = document.getElementById(previousMedia.id);
        if(video && !video.paused) {
          video.pause();
        }
      }
    }
    this.playStory(currentIndex);
    this.setStorySeen();
  }
  
  playStory(currentIndex) {
    if(this._imageGallery) {
      this.setState({
        currentStoryItem: this.getCurrentStoryItem(),
        currentIndex: currentIndex
      });
      
      var currentMedia = this.props.item.media[this._imageGallery.getCurrentIndex()];
      
      if(isVideo(currentMedia.original)) {
        var video = document.getElementById(currentMedia.id);
        if(video.paused) {
          video.play();
          this.setState({isVideoPlaying: true});
        }
      }
    }
  }
  
  pauseStory() {
    var itself = this;
    var currentMedia = this.props.item.media[this._imageGallery.getCurrentIndex()];
    if(isVideo(currentMedia.original)) {
      var video = document.getElementById(currentMedia.id);
      if(!video.paused) {
        video.pause();
        this.setState({isVideoPlaying: false});
      }
    }
  }
  
  setStorySeen() {
    if(!this.props.viewStoriesAnonymously) {
      InstagramApi.setStorySeen(this.getCurrentStoryItem());
    }
  }
  
  isCurrentItemVideo() {
    if(this._imageGallery) {
      var currentMedia = this.props.item.media[this._imageGallery.getCurrentIndex()];
      if(currentMedia) {
        return isVideo(currentMedia.original);
      }  
    }
  }
  
  hasReelMentions() {
    return this.state.currentStoryItem.reel_mentions.length > 0;
  }
  
  hasHashtags() {
    return this.state.currentStoryItem.story_hashtags.length > 0;
  }
  
  hasLocations() {
    return this.state.currentStoryItem.story_locations.length > 0;
  }
  
  hasStoryTags() {
    return this.hasReelMentions() || this.hasHashtags() || this.hasLocations();
  }
  
  onStoryClicked() {
    if(this.isCurrentItemVideo()) {
      if(this.state.isVideoPlaying) {
        this.pauseStory();
      } else {
        this.playStory(this.state.currentIndex);
      }
    }
  }
  
  onStoryAuthorUsernameClicked() {
    var authorUsername = this.state.currentStoryItem.user.username;
    window.open('https://www.instagram.com/' + authorUsername + '/');
    AnalyticsUtil.track("Story Author Username Clicked", {username: authorUsername});
  }
  
  onStoryTagClicked(type) {
    switch(type) {
      case 'USER':
      window.open('https://www.instagram.com/' + this.state.currentStoryItem.reel_mentions[0].user.username);
      break;
      case 'HASHTAG':
      window.open('https://www.instagram.com/explore/tags/' + this.state.currentStoryItem.story_hashtags[0].hashtag.name);
      break;
      case 'LOCATION':
      window.open('https://www.instagram.com/explore/locations/' + this.state.currentStoryItem.story_locations[0].location.pk);
      break;
    }
  }
  
  renderStoryTag(type) {
    var iconSrc;
    var tagText;
    
    switch(type) {
      case 'USER':
      iconSrc = this.state.currentStoryItem.reel_mentions[0].user.profile_pic_url;
      tagText = this.state.currentStoryItem.reel_mentions[0].user.username;
      break;
      case 'HASHTAG':
      iconSrc = chrome.extension.getURL('img/icon_hashtag.png');
      tagText = this.state.currentStoryItem.story_hashtags[0].hashtag.name;
      break;
      case 'LOCATION':
      iconSrc = chrome.extension.getURL('img/icon_location.png');
      tagText = this.state.currentStoryItem.story_locations[0].location.name;
      break;
    }
    
    return (
      <Chip
        style={{marginBottom: '5px', flexDirection: 'row', cursor: 'pointer'}}
        labelStyle={{maxWidth: '85px', overflowX: 'hidden', textOverflow: 'ellipsis'}}
        onClick={() => this.onStoryTagClicked(type)}>
        <Avatar color="#444" src={iconSrc} />
        {tagText}
      </Chip>  
    );
  }
  
  renderStoryTags() {
    return (
      <div>
        {this.hasReelMentions() && this.renderStoryTag('USER')}
        {this.hasHashtags() && this.renderStoryTag('HASHTAG')}
        {this.hasLocations() && this.renderStoryTag('LOCATION')}
      </div>
    );
  }
  
  renderLeftNav(onClick, disabled) {
    if(disabled) { return; }
    return (
      <img
        src={chrome.extension.getURL('img/icon_arrow_left.png')}
        className="story-arrow-left"
        onClick={onClick}/>
    );
  }
  
  renderRightNav(onClick, disabled) {
    if(disabled) { return; }
    return (
      <img
        src={chrome.extension.getURL('img/icon_arrow_right.png')}
        className="story-arrow-right"
        onClick={onClick}/>
    );
  }
  
  renderStoryVideoSlide = (item) => {
    return (
      <div>
        <video
          className="story-media-item"
          id={item.id}
          src={item.original}
          preload="metadata"
          />
      </div>
    );
  }
  
  renderStoryImageSlide = (item) => {
    return (
      <div>
        <img
          className="story-media-item"
          onLoad={(event)  => {
            var currentMedia = this.props.item.media;
            var index = currentMedia.findIndex(mediaItem => mediaItem.original === item.original );
            var itemmm = currentMedia[index];
            itemmm.isLoaded = true;
            this.props.item.media[index] = itemmm;
          }
        }
        src={item.original}
        />
    </div>
  );
}

renderStorySlide = (item) => {
  return (isVideo(item.original)) ? this.renderStoryVideoSlide(item) : this.renderStoryImageSlide(item);
}

render() {
  const styles = {
    storyImage: {
      height: 'auto',
      maxWidth: '100%',
      width: 'auto',
      position: 'relative',
      cursor: (this.isCurrentItemVideo()) ? 'pointer' : 'default'
    },
    overlayTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1
    },
    playOverlay: {
      width: '48px',
      position: 'absolute',
      zIndex: 1
    },
    storyLinkButton: {
      position: 'absolute',
      bottom: '10px',
      flexDirection: 'row',
      zIndex: 1,
      cursor: 'pointer'
    },
    storyTagsContainer: {
      position: 'absolute',
      left: '10px',
      bottom: '5px',
      zIndex: 1,
    },
    storyProgress: {
      width: '100%',
      height: '2px',
      position: 'absolute',
      marginTop: '10px',
      paddingLeft: '10px',
      paddingRight: '10px',
      zIndex: 1
    },
    storyTimestamp: {
      position: 'absolute',
      marginTop: '20px',
      paddingLeft: '15px',
      zIndex: 1,
      color: 'white'
    }
  }
  
  return (
    <div style={styles.storyImage}> 
      
      {this.isCurrentItemVideo() && !this.state.isVideoPlaying &&
        <img className="center-div" src={chrome.extension.getURL('img/icon_play_button.png')} style={styles.playOverlay} onClick={() => this.onStoryClicked()}/>
      }
      
      <div style={styles.overlayTop}>
        <img src={chrome.extension.getURL('img/overlayTop.png')} style={{width: '100%'}} alt=""/>
      </div>
      
      <StoryProgress
        style={styles.storyProgress}
        storyLength={this.props.item.media.length} 
        activeSlide={this.state.currentIndex} />
      
      <span style={styles.storyTimestamp}>{getTimeElapsed(this.state.currentStoryItem.taken_at)}</span>
      
      {this.state.currentStoryItem.link_text &&
        <Chip
          onClick={() => window.open(this.state.currentStoryItem.story_cta[0].links[0].webUri)}
          style={styles.storyLinkButton}
          className="center-horizontal"
          >
          <Avatar color="#444" icon={<LinkIcon />} />
          {this.state.currentStoryItem.link_text}
        </Chip>
      }
      
      {this.hasStoryTags() &&
        <div style={styles.storyTagsContainer}>
          {this.renderStoryTags()}
        </div>
      }
      
      <StoryGallery
        ref={i => this._imageGallery = i}
        items={this.props.item.media}
        infinite={false}
        showThumbnails={false}
        slideDuration={0}
        autoPlay={false}
        showNav={true}
        renderLeftNav={this.renderLeftNav}
        renderRightNav={this.renderRightNav}
        renderItem={this.renderStorySlide}
        showPlayButton={false}
        showFullscreenButton={(!this.props.isPopup)}
        disableArrowKeys={true}
        showBullets={false}
        onSlide={(currentIndex) => this.onSlide(currentIndex)}
        onClick={() => this.onStoryClicked()}
        />
    </div>
  );
}
}

const mapStateToProps = (state) => {
  return {
    viewStoriesAnonymously: state.stories.viewStoriesAnonymously
  };
};

export default connect(mapStateToProps)(Story);