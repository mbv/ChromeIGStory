import {combineReducers} from 'redux';

import stories from './stories';
import popup from './popup';
import content from './content';

export default combineReducers({
  stories,
  popup,
  content
});
