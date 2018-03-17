import React, { Component } from 'react';
import {connect} from 'react-redux';
import Story from '../../../../../utils/Story';
import LiveVideo from '../../../../../utils/LiveVideo';
import {getStorySlide} from '../../../../../utils/Utils';

class StoryContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStoryObject: null,
      currentStoryComponent: null
    }
  }
  
  componentWillReceiveProps = (nextProps) => {
    if (nextProps.currentStoryObject && nextProps.currentStoryObject !== this.state.currentStoryObject) {
      switch(nextProps.currentStoryObject.type) {
        case 'USER_STORY':
        var storySlide = getStorySlide(nextProps.currentStoryObject.story);
        var storyItemComponent = (
          <Story item={storySlide}/>
        );
        this.setCurrentStoryComponent(nextProps.currentStoryObject, storyItemComponent);
        break;
        case 'LIVE_REPLAY':
        var storyItemComponent = (
          <LiveVideo isLiveVideoReplay liveItem={nextProps.currentStoryObject.story.post_live_item.broadcasts[0]}/>
        );
        this.setCurrentStoryComponent(nextProps.currentStoryObject, storyItemComponent);
        break;
        case 'LIVE':
        var storyItemComponent = (
          <LiveVideo liveItem={nextProps.currentStoryObject.story.broadcast}/>
        );
        this.setCurrentStoryComponent(nextProps.currentStoryObject, storyItemComponent);
        break;
      }
    }
  }
  
  setCurrentStoryComponent(storyObject, storyItemComponent) {
    this.setState({
      currentStoryObject: storyObject,
      currentStoryComponent: storyItemComponent
    });
  }
  
  render() {
    return (
      <div>
        {this.state.currentStoryComponent}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    currentStoryObject: state.content.currentStoryObject
  };
};

export default connect(mapStateToProps)(StoryContainer);