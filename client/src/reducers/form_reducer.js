import {
  FORM_ORIGINAL_CHANGED,
  FORM_TRANSLATED_CHANGED,
  ADD_NEW_PHRASE,
  CLOSE_ADD_NEW_MODAL,
  FORM_SCROLL_TO_PAGE
} from '../actions/types';

const INITIAL_STATE = {
  original: '',
  translated: '',
  current_page: 0
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FORM_ORIGINAL_CHANGED:
      return { ...state, original: action.payload };

    case FORM_TRANSLATED_CHANGED:
      return { ...state, translated: action.payload };

    case ADD_NEW_PHRASE:
    case CLOSE_ADD_NEW_MODAL:
      return INITIAL_STATE;

    case FORM_SCROLL_TO_PAGE:
      return { ...state, current_page: action.page };

    default:
      return state;
  }
}
