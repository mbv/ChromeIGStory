import React, { Component } from 'react';
import {connect} from 'react-redux';
import FriendStoryCard from './FriendStoryCard';

class FriendStoriesList extends Component {  
  render() {
    return (
      <div>
        {
          this.props.friendStories.tray.map((storyTrayItem, key) => {
            return (
              <FriendStoryCard key={key} storyItem={storyTrayItem}/>        
            );
          })
        }
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