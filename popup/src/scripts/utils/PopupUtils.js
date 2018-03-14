import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {proxyStore} from '../index.js';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  INSTAGRAM_MAIN_CONTAINER_CLASS_NAME,
  muiTheme
} from '../../../../utils/Constants';


export function setCurrentStoryObject(type, story) {
  if(story) {
    proxyStore.dispatch({
      type: 'SET_IS_SEARCH_ACTIVE',
      isSearchActive: false
    });
    proxyStore.dispatch({
      type: 'SET_CURRENT_POPUP_STORY_OBJECT',
      currentStoryObject: {
        type: type,
        story: story
      }
    });
  } else {
    proxyStore.dispatch({
      type: 'SET_IS_SNACKBAR_ACTIVE',
      isSnackbarActive: true
    });
  }
}