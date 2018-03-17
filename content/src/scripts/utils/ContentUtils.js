import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {proxyStore} from '../index.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import StoryContainer from '../components/app/StoryContainer';
import StoryModal from '../components/app/StoryModal';
import {
  INSTAGRAM_MAIN_CONTAINER_CLASS_NAME,
  INSTAGRAM_PROFILE_ARTICLE_CONTAINER_CLASS_NAME,
  INSTAGRAM_HASHTAG_ARTICLE_CONTAINER_CLASS_NAME,
  INSTAGRAM_LOCATION_ARTICLE_CONTAINER_CLASS_NAME,
  muiTheme
} from '../../../../utils/Constants';

export function setCurrentStoryObject(type, story) {
  if(story) {
    injectStoryModal();
    openStoryModal();
    proxyStore.dispatch({
      type: 'SET_CURRENT_CONTENT_STORY_OBJECT',
      currentStoryObject: {
        type: type,
        story: story
      }
    });
  }
}

export function openStoryModal() {
  proxyStore.dispatch({
    type: 'SET_IS_STORY_MODAL_OPEN',
    isStoryModalOpen: true
  });
}

export function closeStoryModal() {
  proxyStore.dispatch({
    type: 'SET_IS_STORY_MODAL_OPEN',
    isStoryModalOpen: false
  });
}

export function injectStoryModal() {
  if(!document.getElementById("storyModalContainer")) {
    document.getElementById("storyModalContainer");
    var storyModal = (
      <StoryModal/>
    );
    
    var storyModalContainer = document.createElement('div');
    storyModalContainer.id = "storyModalContainer";
    
    document.body.appendChild(storyModalContainer);
    renderStoryItem(storyModal, storyModalContainer);
  }
}

export function injectStoryContainer() {
  if(!document.getElementById("storyPaneContainer")) {
    var storyContainerComponent = (
      <StoryContainer/>
    );
    
    var mainContainer = document.getElementsByClassName(INSTAGRAM_MAIN_CONTAINER_CLASS_NAME)[0];
    mainContainer.style.flexDirection = 'row';
    
    var profileArticleContainer = document.getElementsByClassName(INSTAGRAM_PROFILE_ARTICLE_CONTAINER_CLASS_NAME)[0];
    var hashtagArticleContainer = document.getElementsByClassName(INSTAGRAM_HASHTAG_ARTICLE_CONTAINER_CLASS_NAME)[0];
    var locationArticleContainer = document.getElementsByClassName(INSTAGRAM_LOCATION_ARTICLE_CONTAINER_CLASS_NAME)[0];
    var articleWidth = 'calc(60% - 40px)';
    
    if(profileArticleContainer) { profileArticleContainer.style.width = articleWidth; }
    if(hashtagArticleContainer) { hashtagArticleContainer.style.width = articleWidth; }
    if(locationArticleContainer) { locationArticleContainer.style.width = articleWidth; }
    
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