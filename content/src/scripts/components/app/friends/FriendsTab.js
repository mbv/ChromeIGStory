import React, {Component} from 'react';
import {connect} from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import LiveFriendVideoReplaysList from './LiveFriendVideoReplaysList';
import LiveFriendVideosList from './LiveFriendVideosList';
import FriendStoriesList from './FriendStoriesList';
import $ from 'jquery';

import {TAB_CONTAINER_HEIGHT, TAB_BACKGROUND_COLOR_WHITE} from '../../../../../../utils/Constants';

class FriendsTab extends Component {
  render() {
    const styles = {
      container: {
        marginTop: '10px'
      },
      refreshIndicator: {
        position: 'relative',
        margin: '0 auto'
      },
    };
    
    if(this.props.isLoading && this.props.friendStories.tray.length == 0) {
      return (
        <div style={styles.container}>
          <CircularProgress className="center-div" size={60}/>
        </div>
      );
    }
    return (
      <div style={styles.container}>
        {this.props.isLoading && this.props.friendStories.tray.length > 0 && 
          <RefreshIndicator
            size={40}
            left={10}
            top={0}
            status="loading"
            style={styles.refreshIndicator}/>
        }
        
        {this.props.friendStories.post_live && 
          <LiveFriendVideoReplaysList liveVideoReplays={this.props.friendStories.post_live.post_live_items}/>
        }
        
        <LiveFriendVideosList liveVideoItems={this.props.friendStories.broadcasts}/>
        
        <FriendStoriesList friendStories={this.props.friendStories}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    friendStories: state.stories.friendStories
  };
};

export default connect(mapStateToProps)(FriendsTab);