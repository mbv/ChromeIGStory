import React, { Component } from 'react';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import {setCurrentStoryObject} from '../../../utils/ContentUtils';
import LiveVideoReplayDownloadDialog from '../../../../../../utils/LiveVideoReplayDownloadDialog';

class ViewLiveButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDownloadLiveVideoDialogOpen: false,
      isDownloadingStory: false,
      isRightClickMenuActive: false,
      rightClickMenuAnchor: null
    }
  }
  
  componentDidMount() {
    // hijack default right click context menu and display custom context menu
    if(this.props.isLiveReplay) {
      this.refs.ViewLiveButton.addEventListener('contextmenu', function(ev) {
        ev.preventDefault();
        this.setState({
          rightClickMenuAnchor: ev.currentTarget,
          isRightClickMenuActive: true
        });
        return true;
      }.bind(this), false);
    }
  }
  
  handleRightClickMenuRequestClose() {
    this.setState({
      isRightClickMenuActive: false,
    });
  };
  
  onViewClicked() {
    setCurrentStoryObject((this.props.isLiveReplay) ? 'LIVE_REPLAY' : 'LIVE', this.props.storyItem);
  }
  
  render() {
    var buttonText = 'View LIVE' + ((this.props.isLiveReplay) ? ' Replay' : '');
    var buttonIcon = chrome.extension.getURL((this.props.isLiveReplay) ? 'img/icon_post_live.png' : 'img/icon_live.png');
    
    return (
      <div ref="ViewLiveButton">
        <Chip
          className="view-additional-story-button center-horizontal"
          onClick={() => this.onViewClicked()}>
          <Avatar className="view-additional-story-button-image" src={buttonIcon}/>
          {buttonText}
        </Chip>
        <Popover
          open={this.state.isRightClickMenuActive}
          anchorEl={this.state.rightClickMenuAnchor}
          anchorOrigin={{horizontal: 'middle', vertical: 'center'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={() => this.handleRightClickMenuRequestClose()}>
          <Menu>
            <MenuItem
              primaryText="Download Live Video"
              leftIcon={<DownloadIcon />} 
              onClick={() => {
                this.handleRightClickMenuRequestClose();
                this.setState({isDownloadLiveVideoDialogOpen: true});
              }}
              />
          </Menu>
        </Popover>
        
        {this.props.storyItem.post_live_item &&
          <LiveVideoReplayDownloadDialog
            isOpen={this.state.isDownloadLiveVideoDialogOpen}
            liveVideoReplays={this.props.storyItem.post_live_item.broadcasts}
            onRequestClose={() => this.setState({isDownloadLiveVideoDialogOpen: false})}
            />
        }
        
      </div>
    )
  }
}

export default ViewLiveButton;