import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {proxyStore} from '../index.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import StoryContainer from '../components/app/StoryContainer';
import {
  INSTAGRAM_MAIN_CONTAINER_CLASS_NAME,
  muiTheme
} from '../../../../utils/Constants';

export function setCurrentStoryObject(type, story) {
  proxyStore.dispatch({
    type: 'SET_CURRENT_CONTENT_STORY_OBJECT',
    currentStoryObject: {
      type: type,
      story: story
    }
  });
}

export function injectStoryContainer() {
  if(!document.getElementById("storyPaneContainer")) {
    var storyContainerComponent = (
      <StoryContainer/>
    );
    
    var mainContainer = document.getElementsByClassName(INSTAGRAM_MAIN_CONTAINER_CLASS_NAME)[0];
    mainContainer.style.flexDirection = 'row';
    
    var storyPaneContainer = document.createElement('div');
    storyPaneContainer.id = "storyPaneContainer";
    storyPaneContainer.style.width = '53vh';
    
    mainContainer.insertBefore(storyPaneContainer, mainContainer.childNodes[0]);
    renderStoryItem(storyContainerComponent, storyPaneContainer);
  }
}

export function renderStoryItem(storyItemComponent, container) {
  render(
    <Provider store={proxyStore}>
      <MuiThemeProvider muiTheme={muiTheme}>
        {storyItemComponent}
      </MuiThemeProvider>  
    </Provider>, container
  );
}