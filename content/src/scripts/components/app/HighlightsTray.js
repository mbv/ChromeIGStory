import React, { Component } from 'react';
import {connect} from 'react-redux';
import LinearProgress from 'material-ui/LinearProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import StoryTrayItem from './StoryTrayItem';
import InstagramApi from '../../../../../utils/InstagramApi';
import {setCurrentStoryObject} from '../../utils/ContentUtils';

class HighlightsTray extends Component {
  constructor(props) {
    super(props);
    this.state = {
      highlightItems: this.props.highlightItems
    }
  }
  
  componentDidMount() {
    var unfetchedHighlightItemIds = [];
    this.state.highlightItems.forEach(function(highlightItem) {
      if(!highlightItem.items) {
        unfetchedHighlightItemIds.push(highlightItem.id);
      }
    });
    if(unfetchedHighlightItemIds.length > 0) {
      InstagramApi.getReelsMedia(unfetchedHighlightItemIds, (reels) => {
        var tempHighlightItems = this.state.highlightItems;
        tempHighlightItems.forEach(function(highlightItem, index) {
          if(!highlightItem.items) {
            tempHighlightItems[index].items = reels.reels[highlightItem.id].items;
          }
        });
        this.setState({highlightItems: tempHighlightItems});
      }).catch(function(e) {
        // TODO: figure out why reelsMedia API sometimes fails
        // remove all highlights that weren't possible to fetch
        this.setState({highlightItems: this.state.highlightItems.filter(tempHighlightItem => tempHighlightItem.items)});
      }.bind(this));
    }
  }
  
  onViewUserStory(storyItem) {
    setCurrentStoryObject('USER_STORY', storyItem);
  }
  
  render() {
    const highlightTrayItems = this.state.highlightItems.map((storyTrayItem, key) => {
      return (
        <StoryTrayItem
          key={key}
          trayItemIndex={key}
          storyItem={storyTrayItem}
          onViewUserStory={(storyItem) => this.onViewUserStory(storyItem)}
          />
      )
    });
    
    return (
      <div>
        <div className="trayContainer">
          {highlightTrayItems}
        </div>
        <div className="trayContainerEdgeFade"></div>
      </div>
    )
  }
}

export default connect(null)(HighlightsTray);