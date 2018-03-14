import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import {getUserFromStoryResponse, getTimeElapsed, downloadStory} from '../../../../../../utils/Utils';
import {setCurrentStoryObject} from '../../../utils/ContentUtils';
import InstagramApi from '../../../../../../utils/InstagramApi';

class UserProfileStoryItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDownloadingStory: false,
      isRightClickMenuActive: false,
      rightClickMenuAnchor: null
    }
  }
  
  componentDidMount() {
    // hijack default right click context menu and display custom context menu
    this.refs.UserProfileStoryItem.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      if(!this.state.isDownloadingStory) {
        this.setState({
          rightClickMenuAnchor: ev.currentTarget,
          isRightClickMenuActive: true
        });
      }
      return true;
    }.bind(this), false);
    
    this.refs.UserProfileStoryItem.addEventListener('click', function(ev) {
      setCurrentStoryObject('USER_STORY', this.props.storyItem);
    }.bind(this), false);
  }
  
  handleRightClickMenuRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };

  render() {
    return (
      <div ref="UserProfileStoryItem" className="center-horizontal story-user-image-click-jacker">
        {this.state.isDownloadingStory && <CircularProgress className="center-div" style={{position: 'absolute'}} size={180} />}
        <Popover
          open={this.state.isRightClickMenuActive}
          anchorEl={this.state.rightClickMenuAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.handleRightClickMenuRequestClose()}>
          <Menu>
            <MenuItem
              primaryText="Download Story"
              leftIcon={<DownloadIcon />} 
              onClick={() => {
                this.handleRightClickMenuRequestClose();
                this.setState({isDownloadingStory: true});
                downloadStory(this.props.storyItem.reel, () => {
                  this.setState({isDownloadingStory: false});
                });
              }}/>
            </Menu>
          </Popover>
        </div>
      )
    }
  }
  
  export default UserProfileStoryItem;