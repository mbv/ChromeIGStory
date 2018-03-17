import React, { Component } from 'react';
import { MediaPlayer } from 'dashjs';
import MediaPlayerEvents from "../node_modules/dashjs/build/es5/src/streaming/MediaPlayerEvents.js";
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import VisibilityIcon from 'material-ui/svg-icons/action/visibility';
import CircularProgress from 'material-ui/CircularProgress';
import $ from 'jquery';
import {getLiveVideoManifestObject} from './Utils';
import AnalyticsUtil from './AnalyticsUtil';
import InstagramApi from './InstagramApi';

class LiveVideo extends Component {
  constructor(props){
    super(props);
    this.state = {
      liveItem: this.props.liveItem,
      liveVideoPlayer: null,
      chatMessagesList: [],
      updateInfoInterval: null,
      hasEnded: false,
      isPlaying: false,
      isInitialized: false,
      isInterrupted: false
    }
  }
  
  componentDidMount() {
    if(!this.props.isLiveVideoReplay) {
      this.setState({updateInfoInterval: setInterval(function() {
        // update the video information every 8 seconds
        this.updateVideoInformation();
      }.bind(this), 8000)}); 
    }
  }
  
  componentWillReceiveProps(nextProps) {
    if(nextProps.liveItem.id != this.state.liveItem.id) {
      this.pauseLiveVideo();
      if(this.state.liveVideoPlayer !== null) {
        this.state.liveVideoPlayer.reset();
      }
      this.setState({
        liveItem: nextProps.liveItem,
        liveVideoPlayer: null,
        chatMessagesList: []
      });
    }
  }
  
  intializeLiveVideo() {
    // fetch initial set of comments
    if(this.props.isLiveVideoReplay) {
      this.fetchLiveVideoReplayComments(0);
    } else {
      this.fetchLiveVideoComments(null);
    }
    this.setState({isInitialized: true});
  }
  
  componentWillUnmount() {
    this.pauseLiveVideo();
  }
  
  // updates the live viewers count and fetches new comments for the live video
  updateVideoInformation() {
    if(this.state.isPlaying) {
      var lastComment = this.state.chatMessagesList[0];
      this.fetchLiveVideoComments(lastComment != null ? lastComment.created_at : null);
    }
    InstagramApi.getLiveVideoInfo(this.state.liveItem.id, (liveVideoInfo) => {
      if(liveVideoInfo.broadcast_status === 'interrupted') {
        this.setState({isInterrupted: true});
      } else if(liveVideoInfo.broadcast_status === 'active') {
        this.setState({isInterrupted: false});
      } else {
        this.setState({hasEnded: true});
        this.pauseLiveVideo();
      }
      this.setState({liveItem: liveVideoInfo});
    });
  }
  
  fetchLiveVideoComments(timestamp) {
    InstagramApi.getLiveVideoComments(this.state.liveItem.id, timestamp, (liveVideoCommentsResponse) => {
      if(liveVideoCommentsResponse.comments) {
        liveVideoCommentsResponse.comments.slice(0).reverse().map((chatMessage, key) => {
          this.setState({chatMessagesList: [
            ...this.state.chatMessagesList, chatMessage
          ]});
        });
        this.autoScrollChat();
      }
    });
  }
  
  // fetch the comments for a post-live video
  // TODO: right now it only fetches the first batch - need to fetch in an interval based on offset
  fetchLiveVideoReplayComments(timestamp) {
    InstagramApi.getLiveVideoReplayComments(this.state.liveItem.id, timestamp, (liveVideoReplayCommentsResponse) => {
      if(liveVideoReplayCommentsResponse.comments) {
        liveVideoReplayCommentsResponse.comments.slice(0).reverse().map((chatMessage, key) => {
          this.setState({chatMessagesList: [
            ...this.state.chatMessagesList, chatMessage
          ]});
        });
        this.autoScrollChat();
      }
    });
  }
  
  autoScrollChat() {
    var chatBox = $('#chatbox');
    if(chatBox && chatBox[0]) {
      $(chatBox).animate({
        scrollTop: chatBox.get(0).scrollHeight
      }, 1000);
    }  
  }
  
  onChatMesssageAuthorUsernameClicked(index) {
    var chatMessage = this.state.chatMessagesList[index];
    var chatMessageAuthor = (this.state.isLiveVideoReplay) ? chatMessage.comment.user : chatMessage.user;
    if(chatMessageAuthor) {
      window.open('https://www.instagram.com/' + chatMessageAuthor.username + '/');
      AnalyticsUtil.track("Live Video Comment Author Username Clicked", {username: chatMessageAuthor.username});
    }
  }
  
  onLiveVideoClicked() {
    if(this.state.isPlaying) {
      this.pauseLiveVideo();
    } else {
      this.playLiveVideo();
    }
  }
  
  playLiveVideo() {
    if(this.state.liveVideoPlayer == null) {
      let player = MediaPlayer().create();
      
      player.getDebug().setLogToBrowserConsole(false);
      
      player.on(MediaPlayerEvents.PLAYBACK_NOT_ALLOWED, function() {
        this.setState({requiresPlayInteraction: true});
      }.bind(this));
      
      player.on(MediaPlayerEvents.CAN_PLAY, function() {
        player.play();
        this.setState({isPlaying: true});
      }.bind(this));
      
      player.on(MediaPlayerEvents.ERROR, function(error) {
        if(error.event && error.event.includes && error.event.includes('MEDIA_ERR_DECODE')) {
          this.setState({liveVideoPlayer: null});
          this.playLiveVideo();
        }
      }.bind(this));
      
      if(this.props.isLiveVideoReplay) {
        player.initialize(document.querySelector('#liveVideoPlayer-' + this.state.liveItem.id));
        // a post-live video object contains a string representation of the manifest that needs to be parsed
        var manifestObject = getLiveVideoManifestObject(this.state.liveItem.dash_manifest);
        player.attachSource(manifestObject);
      } else {
        var playbackUrl = this.state.liveItem.dash_playback_url;
        player.initialize(document.querySelector('#liveVideoPlayer-' + this.state.liveItem.id), playbackUrl, true);
        // this.props.onPosterChanged(this.state.liveItem.cover_frame_url);
      }
      
      this.setState({liveVideoPlayer: player});      
      this.intializeLiveVideo();
    } else {
      this.state.liveVideoPlayer.play();
      this.setState({isPlaying: true});
    }
  }
  
  pauseLiveVideo() {
    if(this.state.liveVideoPlayer != null) {
      this.state.liveVideoPlayer.pause();
      this.setState({isPlaying: false});
    }
    clearInterval(this.state.updateInfoInterval);
  }
  
  render() {
    const styles = {
      liveVideoContainer: {
        height: '100%',
        position: 'relative',
        textAlign: 'center'
      },
      liveVideo: {
        width: '100%'
      },
      chatMessageStyle: {
        fontSize: '12px',
        paddingLeft: '60px',
        paddingTop: '12px',
        paddingRight: '0px',
        paddingBottom: '0px'
      },
      chatBox: {
        backgroundImage: 'url(' + chrome.extension.getURL('img/overlayBottom.png') + ')',
        backgroundSize: 'cover',
        textAlign: 'left',
        bottom: '0px'
      },
      statusOverlay: {
        width: '100%',
        height: '100%',
        background: '#323232',
        position: 'absolute',
        color: 'white',
        fontSize: '20px',
        textAlign: 'center',
        zIndex: 1
      },
      playOverlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        background: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1
      },
      largeIcon: {
        width: 60,
        height: 60,
      },
      large: {
        width: 120,
        height: 120,
        padding: 30,
      },
      liveCountLabel : {
        background: 'rgba(0,0,0,0.5)',
        color: 'white',
        borderRadius: '5px',
        float: 'right',
        marginTop: '-2px',
        marginLeft: '5px',
        marginRight: '10px',
        paddingTop: '5px',
        paddingRight: '7px',
        paddingLeft: '7px',
        flexDirection: 'row'
      },
      viewCountSpan: {
        marginTop: '3px',
        marginBottom: '0px',
        fontSize: '12px',
        float: 'left'
      },
      storyOverlayTop: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1
      },
      liveVideoInfoContainer: {
        right: '10px',
        top: '15px',
        zIndex: 1,
        position: 'absolute',
        flexDirection: 'row'
      },
      playOverlay: {
        width: '48px',
        position: 'absolute',
        zIndex: 1
      }
    }
    
    const chatMessageListData = this.state.chatMessagesList.map((chatMessage, key) => {
      var comment = chatMessage;
      if(chatMessage.comment) {
        comment = chatMessage.comment;
      }
      return (
        <ListItem
          key={key}
          disabled={true}
          style={styles.chatMessageStyle}
          leftAvatar={<Avatar src={comment.user.profile_pic_url} style={{cursor: 'pointer'}} size={32} onClick={() => this.onChatMesssageAuthorUsernameClicked(key)} />}
          primaryText={comment.user.username}
          secondaryText={
            <p style={{color: 'white', height: 'initial', fontSize: '12px'}}>
              {comment.text}
            </p>
          }
          secondaryTextLines={2}
          />
      )
    });
    
    return (
      <div style={styles.liveVideoContainer}>
        {this.state.hasEnded &&
          <div style={styles.statusOverlay}><span className="center-div" style={{width: '100%'}}>This live video has ended</span></div>
        }
        {!this.state.isPlaying &&
          <img className="center-div" src={chrome.extension.getURL('img/icon_play_button.png')} style={styles.playOverlay} onClick={() => this.onLiveVideoClicked()}/>
        }
        {this.state.isInterrupted && this.state.isInitialized &&
          <div style={styles.statusOverlay}><span className="center-div" style={{width: '100%'}}>
            <p>Live video paused due to interruption</p>
            <CircularProgress className="center-horizontal" style={{position: 'absolute'}} size={80} color='white'/>
          </span></div>
        }
        <div style={styles.storyOverlayTop}>
          <img src={chrome.extension.getURL('img/overlayTop.png')} style={{width: '100%'}} alt=""/>
        </div>
        {!this.props.isLiveVideoReplay &&
          <div style={styles.liveVideoInfoContainer}>
            <div style={styles.liveCountLabel}>
              <VisibilityIcon color="#ffffff" style={{float: 'left'}} viewBox={'0 0 32 32'}/>
              <p style={styles.viewCountSpan}>{this.state.liveItem.viewer_count}</p>
            </div>
            <img src={chrome.extension.getURL('img/icon_live.png')} style={{height: '25px'}} alt="Live Icon"/>
          </div>
        }
        <video
          id={"liveVideoPlayer-" + this.state.liveItem.id}
          style={styles.liveVideo}
          poster={this.state.liveItem.cover_frame_url}
          src={this.state.liveItem.dash_playback_url}
          onClick={() => this.onLiveVideoClicked()}
          />
        {this.state.chatMessagesList.length > 0 &&
          <div id="chatbox" style={styles.chatBox} className="fadedScroller">
            <div id="chatmessages">
              <List style={{paddingTop: '0px', paddingBottom: '10px'}}>
                {chatMessageListData}
              </List>
            </div>
          </div>
        }  
      </div>
    )
  }
}

export default LiveVideo;