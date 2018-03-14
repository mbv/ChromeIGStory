import React, {Component} from 'react';
import {connect} from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import RefreshIndicator from 'material-ui/RefreshIndicator';
import LiveFriendVideosList from '../friends/LiveFriendVideosList';
import SuggestedStoriesList from './SuggestedStoriesList';
import $ from 'jquery';

import {TAB_CONTAINER_HEIGHT, TAB_BACKGROUND_COLOR_WHITE} from '../../../../../../utils/Constants';

class ExploreTab extends Component {
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
    
    return (
      <div style={styles.container}>
        {this.props.exploreStories.tray.length === 0 && 
          <RefreshIndicator
            size={40}
            left={10}
            top={0}
            status="loading"
            style={styles.refreshIndicator}/>
        }
        
        {this.props.topLiveVideos.length > 100 &&
          <LiveFriendVideosList
            liveVideoItems={this.props.topLiveVideos}
            onSelectStory={(story) => this.props.onSelectStory(story)}/>  
        }
        
        <SuggestedStoriesList
          stories={this.props.exploreStories}
          onSelectStory={(story) => this.props.onSelectStory(story)}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    exploreStories: state.stories.exploreStories,
    topLiveVideos: state.stories.topLiveVideos
  };
};

export default connect(mapStateToProps)(ExploreTab);