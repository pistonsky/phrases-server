import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import auth from './auth_reducer';
import main from './main_reducer';
import item_screen from './item_screen_reducer';
import form from './form_reducer';
import analytics from './analytics_reducer';
import ui from './ui_reducer';
import audio from './audio_reducer';

export default combineReducers({
  auth,
  main,
  item_screen,
  form,
  analytics,
  ui,
  audio,
  routing: routerReducer
});
