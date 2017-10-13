import {
  FACEBOOK_CONNECT_IN_PROGRESS,
  FACEBOOK_CONNECT_IGNORED,
  FACEBOOK_CONNECT_FAILED,
  ADD_NEW_PHRASE,
  SHARE_PHRASE_COMPLETED,
  SHARE_ALL_PHRASES_COMPLETED,
  SHARE_DICTIONARY_COMPLETED
} from '../actions/types';

const INITIAL_STATE = {
  show_facebook_modal: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FACEBOOK_CONNECT_IN_PROGRESS:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal: true
      };

    case FACEBOOK_CONNECT_FAILED:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal: false
      };

    case FACEBOOK_CONNECT_IGNORED:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal: false
      };

    case ADD_NEW_PHRASE:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal:
          [1, 5, 10].indexOf((state[action.type] || 0) + 1) !== -1
      };

    case SHARE_PHRASE_COMPLETED:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal:
          [1, 5, 10].indexOf((state[action.type] || 0) + 1) !== -1
      };

    case SHARE_ALL_PHRASES_COMPLETED:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal:
          [1, 5, 10].indexOf((state[action.type] || 0) + 1) !== -1
      };

    case SHARE_DICTIONARY_COMPLETED:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal:
          [1, 5, 10].indexOf((state[action.type] || 0) + 1) !== -1
      };

    default:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1
      };
  }
}
