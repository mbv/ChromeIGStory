import React, {Component} from 'react';
import {connect} from 'react-redux';
import {List, ListItem, makeSelectable} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ShareIcon from 'material-ui/svg-icons/social/share';
import Story from '../../../../../../utils/Story';

import {fetchStory, getStorySlide, getStoryCoverImage, onStoryAuthorUsernameClicked, getTimeElapsed} from '../../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../../utils/AnalyticsUtil';
import InstagramApi from '../../../../../../utils/InstagramApi';

class FriendStoryCard extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      isDownloadingStory: false
    }
  }
  
  onDownloadStory() {
    if(!this.state.isDownloadingStory) {
      this.setState({isDownloadingStory: true});
      fetchStory(this.props.storyItem, true, () => {
        this.setState({isDownloadingStory: false});
      });
    }
  }
  
  onLoadStory() {
    InstagramApi.getStory(this.props.storyItem.id, (story) => {
      var friendStories = this.props.friendStories;
      const index = friendStories.tray.findIndex(storyItem => storyItem.id === this.props.storyItem.id);
      friendStories.tray[index].items = story.reel.items;
      this.props.dispatch({
        type: 'SET_FRIEND_STORIES',
        friendStories: friendStories
      });
      this.setState({isLoaded: true});
    });
  }
  
  onShareStory() {
    var selectedStory = this.props.storyItem;
    AnalyticsUtil.track("Share Story", AnalyticsUtil.getStoryObject(selectedStory));
    window.open('https://watchmatcha.com/user/' + selectedStory.user.username);
  }
  
  render() {
    const storyItem = this.props.storyItem;
    const isLoaded = this.state.isLoaded;
    var src = "";
    var storySlide;
    const isPrivate = storyItem.user.is_private;
    const name = storyItem.user.username;
    
    if(storyItem.items && storyItem.items[0]) {
      src = getStoryCoverImage(storyItem.items[0])
      storySlide = getStorySlide(storyItem);
    }
    
    return (
      <div style={{marginBottom: '20px', maxWidth: '293px'}}>
        
        <div style={{display: (isLoaded) ? 'flex' : 'initial', flexDirection: 'row', alignItems: 'center', background: 'white', borderRadius: '3px', border: '1px solid #e6e6e6'}}>
          <ListItem
            disabled={isLoaded}
            primaryText={
              <div style={{cursor: 'pointer'}} title={name} onClick={() => { if(isLoaded) {onStoryAuthorUsernameClicked(storyItem)}}}>{name.substr(0, 14) + (name.length > 14 ? '…' : '')}</div>
            }
            secondaryText={getTimeElapsed(storyItem.latest_reel_media)}
            innerDivStyle={{fontSize: '13px', fontWeight: 600}}
            leftAvatar={<Avatar src={storyItem.user.profile_pic_url} style={{cursor: 'pointer'}} onClick={() => { if(isLoaded) {onStoryAuthorUsernameClicked(storyItem)}}}/>}
            onClick={() => this.onLoadStory()}
            />
          {isLoaded &&
            <div style={{flexDirection: 'row', position: 'absolute', right: '10px'}}>
              <IconButton
                tooltip={(isPrivate) ? "Can't Share Private Story" : "Share"}
                disabled={isPrivate}
                onClick={() => this.onShareStory()}>
                <ShareIcon />
              </IconButton>
              <IconButton
                tooltip="Download"
                onClick={() => this.onDownloadStory()}>
                {(this.state.isDownloadingStory) ? <CircularProgress size={24}/> : <DownloadIcon />}
              </IconButton>
            </div>
          }
        </div>
        
        {storyItem.items && isLoaded &&
          <Story style={{maxWidth: '293px'}} item={storySlide} autoPlay={false}/>
        }
        
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories
  };
};

export default connect(mapStateToProps)(FriendStoryCard);