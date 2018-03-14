import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import CircularProgress from 'material-ui/CircularProgress';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import {downloadStory} from '../../../../../utils/Utils';
import {setCurrentStoryObject} from '../../utils/ContentUtils';

class LocationStoryItem extends Component {
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
    this.refs.LocationStoryItemContainer.addEventListener('contextmenu', function(ev) {
      ev.preventDefault();
      if(!this.state.isDownloadingStory) {
        this.setState({
          rightClickMenuAnchor: ev.currentTarget,
          isRightClickMenuActive: true
        });
      }
      return true;
    }.bind(this), false);
  }
  
  onViewLocationStory(storyItem) {
    setCurrentStoryObject('USER_STORY', storyItem);
  }
  
  handleRightClickMenuRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };
  
  render() {
    return (
      <div ref="LocationStoryItemContainer">
      <div className="locationStoryIconContainer unseenStoryItem">
      {this.state.isDownloadingStory && <CircularProgress className="center-div" size={110} />}
      <img className="locationStoryIcon center-div" src={this.props.storyItem.owner.profile_pic_url} onClick={() => this.onViewLocationStory(this.props.storyItem)}/>
      <img src={chrome.extension.getURL('img/icon_location.png')} className="locationIcon"/>
      </div>
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
              downloadStory(this.props.storyItem, () => {
                this.setState({isDownloadingStory: false});
              });
            }}/>
        </Menu>
      </Popover>
      </div>
    )
  }
}

export default LocationStoryItem;