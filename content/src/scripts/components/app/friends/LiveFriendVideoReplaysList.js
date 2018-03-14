import React, { Component } from 'react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import IconButton from 'material-ui/IconButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import ShareIcon from 'material-ui/svg-icons/social/share';
import CircularProgress from 'material-ui/CircularProgress';
import LiveVideo from '../../../../../../utils/LiveVideo';
import LiveVideoReplayDownloadDialog from '../../../../../../utils/LiveVideoReplayDownloadDialog';
import {getTimeElapsed, onStoryAuthorUsernameClicked} from '../../../../../../utils/Utils';
import AnalyticsUtil from '../../../../../../utils/AnalyticsUtil';

class LiveFriendVideoReplaysList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      liveVideoReplays: this.props.liveVideoReplays,
      downloadingIndex: -1,
      isDownloadLiveVideoDialogOpen: false
    }
  }
  
  onDownloadStory(index) {
    this.setState({
      isDownloadLiveVideoDialogOpen: true,
      downloadingIndex: index
    });
  }
  
  onShareStory(index) {
    var selectedStory = this.state.liveVideoReplays[index];
    AnalyticsUtil.track("Share Story", AnalyticsUtil.getStoryObject(selectedStory));
    window.open('https://watchmatcha.com/user/' + selectedStory.user.username);
  }
  
  render() {
    var subtitle;
    var firstLiveVideoReplay = this.state.liveVideoReplays[0];
    if(this.state.liveVideoReplays.length === 1) {
      subtitle = firstLiveVideoReplay.user.username;
    } else {
      var otherCount = this.state.liveVideoReplays.length - 1;
      subtitle = firstLiveVideoReplay.user.username + ' and ' + otherCount + ((otherCount) === 1 ? ' other' : ' others');
    }
    
    const liveVideoReplays = this.state.liveVideoReplays.map((liveVideoReplay, key) => {
      const isPrivate = liveVideoReplay.user.is_private;
      const name = liveVideoReplay.user.username;
      return (
        <div key={key} style={{marginBottom: '20px'}}>
          <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', background: 'white', borderRadius: '3px', border: '1px solid #e6e6e6'}}>
            <ListItem
              disabled
              primaryText={
                <div style={{cursor: 'pointer'}} title={name} onClick={() => onStoryAuthorUsernameClicked(liveVideoReplay)}>{name.substr(0, 14) + (name.length > 14 ? '…' : '')}</div>
              }
              secondaryText={getTimeElapsed(liveVideoReplay.broadcasts[0].published_time)}
              innerDivStyle={{fontSize: '13px', fontWeight: 600}}
              leftAvatar={<Avatar src={liveVideoReplay.user.profile_pic_url} style={{cursor: 'pointer'}} onClick={() => onStoryAuthorUsernameClicked(liveVideoReplay)} />}
              />
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
                <DownloadIcon />
              </IconButton>
            </div>
          </div>
          
          <LiveVideo isLiveVideoReplay liveItem={liveVideoReplay.broadcasts[0]}/>
        </div>
      );
    });
    
    return (
      <Card style={{maxWidth: '293px', marginBottom: '10px'}}>
        <CardHeader
          title="Live Video Replays"
          style={{flexDirection: 'row'}}
          avatar={
            <Avatar
              backgroundColor={'transparent'}
              src={chrome.extension.getURL('img/icon_post_live.png')}
              style={{objectFit: 'scale-down'}}
              />
          }
          subtitle={subtitle}
          subtitleStyle={{fontSize: '12px'}}
          actAsExpander={true}
          showExpandableButton={true}
          />
        <CardText style={{padding: '5px'}} expandable={true}>
          {liveVideoReplays}
          {this.state.isDownloadLiveVideoDialogOpen &&
            <LiveVideoReplayDownloadDialog
              isOpen={this.state.isDownloadLiveVideoDialogOpen}
              liveVideoReplays={this.state.liveVideoReplays[this.state.downloadingIndex].broadcasts}
              onRequestClose={() => this.setState({isDownloadLiveVideoDialogOpen: false})}
              />
          }
        </CardText>
      </Card>
    )
  }
}

export default LiveFriendVideoReplaysList;