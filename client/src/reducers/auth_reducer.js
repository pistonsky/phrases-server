import { randomId } from '../utils/functions';
import {
  SKIP_WELCOME_SCREENS,
  FACEBOOK_LOGIN,
  FACEBOOK_CONNECT,
  FACEBOOK_CONNECT_IN_PROGRESS,
  FACEBOOK_CONNECT_FAILED
} from '../actions/types';

const INITIAL_STATE = {
  id: null,
  facebook_connected: false,
  facebook_connect_in_progress: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SKIP_WELCOME_SCREENS:
      return {
        ...state,
        id: randomId()
      };

    case FACEBOOK_LOGIN:
      return {
        ...state,
        id: action.user_id,
        facebook_connected: true,
        facebook_connect_in_progress: false
      };

    case FACEBOOK_CONNECT:
      return {
        ...state,
        facebook_connected: true,
        facebook_connect_in_progress: false
      };

    case FACEBOOK_CONNECT_IN_PROGRESS:
      return {
        ...state,
        facebook_connect_in_progress: true
      };

    case FACEBOOK_CONNECT_FAILED:
      return {
        ...state,
        facebook_connect_in_progress: false
      };

    default:
      return state;
  }
}
