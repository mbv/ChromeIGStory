import React, { Component } from 'react';
import {connect} from 'react-redux';
import {Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import Subheader from 'material-ui/Subheader';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ShareIcon from 'material-ui/svg-icons/social/share';
import CircularProgress from 'material-ui/CircularProgress';
import Story from '../../../../../../utils/Story';
import InstagramApi from '../../../../../../utils/InstagramApi';
import {fetchStory, getStorySlide, getStoryCoverImage, onStoryAuthorUsernameClicked, getTimeElapsed} from '../../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../../utils/AnalyticsUtil';

class FriendStoriesList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedIndex: -1,
      downloadingIndex: -1,
      isDownloadingStory: false
    }
  }
  
  onDownloadStory(index) {
    if(!this.state.isDownloadingStory) {
      var selectedStory = this.props.friendStories.tray[index];
      this.setState({
        isDownloadingStory: true,
        downloadingIndex: index
      });
      fetchStory(selectedStory, true, () => {
        this.setState({isDownloadingStory: false});
      });
    }
  }
  
  onLoadStory(storyTrayItem) {
    InstagramApi.getStory(storyTrayItem.id, (story) => {
      var friendStories = this.props.friendStories;
      const index = friendStories.tray.findIndex(storyItem => storyItem.id === storyTrayItem.id);
      friendStories.tray[index].items = story.reel.items;
      this.props.dispatch({
        type: 'SET_FRIEND_STORIES',
        friendStories: friendStories
      });
    });
  }
  
  onShareStory(index) {
    var selectedStory = this.props.friendStories.tray[index];
    AnalyticsUtil.track("Share Story", AnalyticsUtil.getStoryObject(selectedStory));
    window.open('https://watchmatcha.com/user/' + selectedStory.user.username);
  }
  
  render() {
    const friendStoriesListData = this.props.friendStories.tray.map((storyTrayItem, key) => {
      var src = "";
      var storySlide;
      var isLoaded;
      const isPrivate = storyTrayItem.user.is_private;
      const name = storyTrayItem.user.username;
      
      if(storyTrayItem.items && storyTrayItem.items[0]) {
        src = getStoryCoverImage(storyTrayItem.items[0])
        storySlide = getStorySlide(storyTrayItem);
        isLoaded = true;
      }
      
      return (
        <div key={key} style={{marginBottom: '20px', maxWidth: '293px'}}>
          
          <div style={{display: (isLoaded) ? 'flex' : 'initial', flexDirection: 'row', alignItems: 'center', background: 'white', borderRadius: '3px', border: '1px solid #e6e6e6'}}>
            <ListItem
              disabled={isLoaded}
              primaryText={
                <div style={{cursor: 'pointer'}} title={name} onClick={() => { if(isLoaded) {onStoryAuthorUsernameClicked(storyTrayItem)}}}>{name.substr(0, 14) + (name.length > 14 ? '…' : '')}</div>
              }
              secondaryText={getTimeElapsed(storyTrayItem.latest_reel_media)}
              innerDivStyle={{fontSize: '13px', fontWeight: 600}}
              leftAvatar={<Avatar src={storyTrayItem.user.profile_pic_url} style={{cursor: 'pointer'}} onClick={() => { if(isLoaded) {onStoryAuthorUsernameClicked(storyTrayItem)}}}/>}
              onClick={() => this.onLoadStory(storyTrayItem)}
              />
            {isLoaded &&
              <div style={{flexDirection: 'row', position: 'absolute', right: '10px'}}>
                <IconButton
                  tooltip={(isPrivate) ? "Can't Share Private Story" : "Share"}
                  disabled={isPrivate}
                  onClick={() => this.onShareStory(key)}>
                  <ShareIcon />
                </IconButton>
                <IconButton
                  tooltip="Download"
                  onClick={() => this.onDownloadStory(key)}>
                  {(this.state.isDownloadingStory && this.state.downloadingIndex === key) ? <CircularProgress size={24}/> : <DownloadIcon />}
                </IconButton>
              </div>
            }
          </div>
          
          {storyTrayItem.items &&
            <Story style={{maxWidth: '293px'}} item={storySlide} autoPlay={false}/>
          }
          
        </div>
        
      )
    });
    
    return (
      <div>
        {friendStoriesListData}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories
  };
};

export default connect(mapStateToProps)(FriendStoriesList);