import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import LinearProgress from 'material-ui/LinearProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import OpenInNewIcon from 'material-ui/svg-icons/action/open-in-new';
import ActionExploreIcon from 'material-ui/svg-icons/action/explore';
import ActionSearchIcon from 'material-ui/svg-icons/action/search';
import VisibilityOnIcon from 'material-ui/svg-icons/action/visibility';
import VisibilityOffIcon from 'material-ui/svg-icons/action/visibility-off';
import PeopleIcon from 'material-ui/svg-icons/social/people';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import StoryTrayItem from './StoryTrayItem';
import LiveVideoTrayItem from './LiveVideoTrayItem';
import LiveVideoReplayTrayItem from './LiveVideoReplayTrayItem';
import StoryContainer from './StoryContainer';
// import StoryGallery from './StoryGallery';
import {renderToolbar, fetchStory, toggleAnonymousStoryViews} from '../../../../../utils/Utils';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStoryGalleryItems, setCurrentStoryObject} from '../../utils/ContentUtils';

import {
  TAB_TEXT_COLOR_DARK_GRAY,
  TAB_TEXT_COLOR_LIGHT_GRAY,
  TAB_BACKGROUND_COLOR_WHITE,
  POPUP_CONTAINER_WIDTH,
  POPUP_CONTAINER_HEIGHT
} from '../../../../../utils/Constants';

class StoriesTray extends Component {
  constructor(props) {
    super(props);
    this.state = {
      storyTrayItems: '',
      isStoryGalleryOpen: false,
      isLoadingTray: true,
      currentStoryGalleryItem: null,
      storyGalleryItems: [],
      currentStoryGalleryType: null,
      selectedStoryTrayType: 'friends'
    }
  }
  
  componentDidMount() {
    var storyItems = this.getStoryItems(this.state.selectedStoryTrayType);
    if(storyItems.length > 0) {
      this.renderStoryTray(this.state.selectedStoryTrayType, storyItems);
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    if(prevProps.friendStories !== this.props.friendStories) {
      this.renderStoryTray(this.state.selectedStoryTrayType, this.getStoryItems(this.state.selectedStoryTrayType));
    }
  }
  
  getStoryItems(type) {
    switch(type) {
      case 'friends':
      return this.props.friendStories;
      case 'explore':
      return this.props.exploreStories.tray;
    }
  }
  
  getStoryTrayItems(selectedStoryTrayType, storyItems) {
    var storyTrayItems = [];
    switch(selectedStoryTrayType) {
      case 'friends':
      var liveVideoReplays = [];
      
      if(storyItems.post_live) {
        liveVideoReplays = storyItems.post_live.post_live_items.map((liveVideoReplay, key) => {
          return (
            <LiveVideoReplayTrayItem
              key={key}
              trayItemIndex={key}
              liveItem={liveVideoReplay}
              onViewLiveVideoReplay={(liveItem) => this.viewLiveVideoReplay(liveItem)}
              />
          )
        }
      );
    }
    
    const liveVideos = storyItems.broadcasts.map((liveVideoItem, key) => {
      return (
        <LiveVideoTrayItem
          key={key}
          trayItemIndex={key}
          liveItem={liveVideoItem}
          onViewLiveVideo={(liveItem) => this.viewLiveVideo(liveItem)}
          />
      )
    });
    
    const friendStoryItems = storyItems.tray.map((storyTrayItem, key) => {
      return (
        <StoryTrayItem
          key={key}
          trayItemIndex={key}
          storyItem={storyTrayItem}
          onViewUserStory={(index) => this.viewUserStory(index)}
          />
      )
    });
    
    storyTrayItems.push(liveVideoReplays);
    storyTrayItems.push(liveVideos);
    storyTrayItems.push(friendStoryItems);
    
    return storyTrayItems;
    case 'explore':
    
    const topLiveVideos = this.props.topLiveVideos.map((liveVideoItem, key) => {
      return (
        <LiveVideoTrayItem
          key={key}
          trayItemIndex={key}
          liveItem={liveVideoItem}
          onViewLiveVideo={(liveItem) => this.viewLiveVideo(liveItem)}
          />
      )
    });
    
    const exploreStoryItems = storyItems.map((storyTrayItem, key) => {
      return (
        <StoryTrayItem
          key={key}
          trayItemIndex={key}
          storyItem={storyTrayItem}
          onViewUserStory={(index) => this.viewUserStory(index)}
          onDownloadStory={(index) => this.onDownloadStory(index)}
          />
      )
    });
    
    storyTrayItems.push(topLiveVideos);
    storyTrayItems.push(exploreStoryItems);
    
    return storyTrayItems;
  }
}

handleStoryTrayTypeChange = (event, index, value) => {
  var selectedStoryTrayType = this.state.selectedStoryTrayType;
  
  var newStoryTrayType;
  if(selectedStoryTrayType === 'friends') {
    newStoryTrayType = 'explore';
  } else {
    newStoryTrayType = 'friends';
  }
  
  this.setState({selectedStoryTrayType: newStoryTrayType});
  
  this.renderStoryTray(newStoryTrayType, this.getStoryItems(newStoryTrayType));
}

renderStoryTray(selectedStoryTrayType, storyItems) {
  var storyTrayItems = this.getStoryTrayItems(selectedStoryTrayType, storyItems);
  this.setState({isLoadingTray: false, storyTrayItems: storyTrayItems});
}

viewUserStory(selectedStory) {
  if(selectedStory.items && selectedStory.items.length > 0) {
    setCurrentStoryObject('USER_STORY', selectedStory);
  } else {
    fetchStory(selectedStory, false, (story) => {
      var index;
      switch(this.state.selectedStoryTrayType) {
        case 'friends':
        var friendStories = this.props.friendStories;
        index = friendStories.tray.findIndex(storyItem => storyItem.id === selectedStory.id);
        friendStories.tray[index].items = story.reel.items;
        this.props.dispatch({
          type: 'SET_FRIEND_STORIES',
          friendStories: friendStories
        });
        break;
        case 'explore':
        var exploreStories = this.props.exploreStories;
        index = exploreStories.tray.findIndex(storyItem => storyItem.id === selectedStory.id);
        exploreStories.tray[index].items = story.reel.items;
        this.props.dispatch({
          type: 'SET_EXPLORE_STORIES',
          exploreStories: exploreStories
        });
        break;
      }
      setCurrentStoryObject('USER_STORY', story);
    });
  }
}

viewLiveVideo(liveItem) {
  var storyGalleryItemsObject = getStoryGalleryItems(liveItem);
  this.showStoryGallery('live', storyGalleryItemsObject.items, liveItem);
}

viewLiveVideoReplay(liveItem) {
  var storyGalleryItemsObject = getStoryGalleryItems(liveItem.broadcasts);
  this.showStoryGallery('liveReplay', storyGalleryItemsObject.items, liveItem);
}

showStoryGallery(type, galleryItems, storyItem) {
  this.setState({
    storyGalleryItems: galleryItems,
    currentStoryGalleryItem: storyItem,
    currentStoryGalleryType: type,
    isStoryGalleryOpen: true
  });
}

render() {
  if(this.state.isLoadingTray) {
    return (
      <LinearProgress mode="indeterminate" />
    )
  }
  
  const toolbarActionsGroup = (
    <ToolbarGroup lastChild={true} style={{flexDirection: 'row'}}>
      <IconButton
        tooltip={"Anonymous Viewing " + ((this.props.viewStoriesAnonymously) ? "Enabled" : "Disabled")}
        tooltipPosition="top-center"
        onClick={() => toggleAnonymousStoryViews((viewStoriesAnonymously) => {
          this.props.dispatch({
            type: 'SET_VIEW_STORIES_ANONYMOUSLY',
            viewStoriesAnonymously: viewStoriesAnonymously
          });
        })}>
        {(this.props.viewStoriesAnonymously) ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
      </IconButton>
      <IconButton
        tooltip={(this.state.selectedStoryTrayType === 'explore') ? 'Friends' : 'Explore'}
        tooltipPosition="bottom-center"
        onClick={()=> {
          this.handleStoryTrayTypeChange();
        }}>
        {(this.state.selectedStoryTrayType === 'explore') ? <PeopleIcon color={TAB_TEXT_COLOR_DARK_GRAY}/> : <ActionExploreIcon color={TAB_TEXT_COLOR_DARK_GRAY}/>}
      </IconButton>
      {!this.state.isFullPopup &&
        <IconButton
          tooltip="Popout"
          tooltipPosition="bottom-center"
          onClick={()=> {
            this.props.dispatch({type: 'launch-popup'});
          }}>
          <OpenInNewIcon color={TAB_TEXT_COLOR_DARK_GRAY}/>
        </IconButton>
      }
    </ToolbarGroup>
  );
  
  return (
    <div style={{marginBottom: '20px', boxShadow: 'rgba(0, 0, 0, 0.118) 0px 5px 5px -5px, rgba(0, 0, 0, 0.118) 5px 0px 5px -5px, rgba(0, 0, 0, 0.118) -5px 0px 5px -5px'}}>
      {renderToolbar(toolbarActionsGroup)}
      <div>
        <div className="trayContainer">
          {this.state.storyTrayItems}
        </div>
        <div className="trayContainerEdgeFade"></div>
      </div>
    </div>
  )
}
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories,
    exploreStories: state.stories.exploreStories,
    topLiveVideos: state.stories.topLiveVideos,
    viewStoriesAnonymously: state.stories.viewStoriesAnonymously,
    isStoryModalOpen: state.content.isStoryModalOpen,
  };
};

export default connect(mapStateToProps)(StoriesTray);