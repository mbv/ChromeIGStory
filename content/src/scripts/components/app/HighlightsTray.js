import React, { Component } from 'react';
import {connect} from 'react-redux';
import LinearProgress from 'material-ui/LinearProgress';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import StoryTrayItem from './StoryTrayItem';
import LiveVideoTrayItem from './LiveVideoTrayItem';
import LiveVideoReplayTrayItem from './LiveVideoReplayTrayItem';
import StoryGallery from './StoryGallery';
import InstagramApi from '../../../../../utils/InstagramApi';
import {getStoryGalleryItems} from '../../utils/ContentUtils';

class HighlightsTray extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStoryGalleryOpen: false,
      currentStoryGalleryItem: null,
      storyGalleryItems: [],
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
      });
    }
  }
  
  showStoryGallery(storyItem) {
    var storyGalleryItemsObject = getStoryGalleryItems(storyItem.items);
    this.setState({
      storyGalleryItems: storyGalleryItemsObject.items,
      currentStoryGalleryItem: storyItem,
      isStoryGalleryOpen: true
    });
  }
  
  render() {
    const highlightTrayItems = this.state.highlightItems.map((storyTrayItem, key) => {
      return (
        <StoryTrayItem
        key={key}
        trayItemIndex={key}
        storyItem={storyTrayItem}
        onViewUserStory={(storyItem) => this.showStoryGallery(storyItem)}
        />
      )
    });
    
    return (
      <div>
      <div className="trayContainer">
      {highlightTrayItems}
      </div>
      <div className="trayContainerEdgeFade"></div>
      <StoryGallery
      isOpen={this.state.isStoryGalleryOpen}
      currentItem={this.state.currentStoryGalleryItem}
      onCloseRequest={() => this.setState({isStoryGalleryOpen: false})}
      type={'userStory'}
      items={this.state.storyGalleryItems}
      />
      </div>
    )
  }
}

export default HighlightsTray;