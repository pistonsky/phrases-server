import { push } from 'react-router-redux';
import * as api from '../api';
import { getUserId } from '../reducers/selectors';
import {
  SKIP_WELCOME_SCREENS,
  FACEBOOK_CONNECT,
  FACEBOOK_LOGIN,
  FACEBOOK_CONNECT_IN_PROGRESS,
  FACEBOOK_CONNECT_IGNORED,
  FACEBOOK_CONNECT_FAILED,
  DATA_LOADING,
  DATA_LOADED,
  DATA_LOADING_FAILED,
  UPDATE_PHRASE,
  DELETE_PHRASE,
  DELETE_DICTIONARY,
  UPDATE_DICTIONARY_NAME
} from './types';
import store from '../store';

export const skipWelcomeScreen = () => async dispatch => {
  dispatch({ type: SKIP_WELCOME_SCREENS }); // this effectively creates a user
  dispatch(push('/app'));
};

export const connectFacebook = ({ user_id, token }) => async dispatch => {
  if (!token) {
    dispatch({ type: FACEBOOK_CONNECT_FAILED });
  } else {
    dispatch({ type: FACEBOOK_CONNECT_IN_PROGRESS });
    try {
      const { status, data: { phrases } } = await api.connectFacebook(
        token,
        user_id
      );
      if (status !== 200) throw status;
      dispatch({ type: FACEBOOK_CONNECT }); // sets 'facebook_connected' flag
      dispatch({ type: DATA_LOADED, phrases });
    } catch (e) {
      dispatch({ type: FACEBOOK_CONNECT_FAILED });
      alert('Login Failed =(');
    }
  }
};

export const loginWithFacebook = token => async dispatch => {
  if (!token) {
    dispatch({ type: FACEBOOK_CONNECT_FAILED });
  } else {
    dispatch({ type: FACEBOOK_CONNECT_IN_PROGRESS });
    try {
      const { status, data } = await api.connectFacebook(token);
      if (status !== 200) throw status;
      dispatch(push('/app'));
      dispatch({ type: FACEBOOK_LOGIN, user_id: data.user_id });
      dispatch({ type: DATA_LOADED, phrases: data.phrases });
    } catch (e) {
      dispatch({ type: FACEBOOK_CONNECT_FAILED });
      alert('Login Failed =(');
    }
  }
};

export const ignoreConnectFacebook = () => {
  return {
    type: FACEBOOK_CONNECT_IGNORED
  };
};

export const refreshPhrases = user_id => async dispatch => {
  dispatch({ type: DATA_LOADING });
  try {
    const { data: { phrases } } = await api.getPhrases({ user_id });
    dispatch({ type: DATA_LOADED, phrases });
  } catch (e) {
    dispatch({ type: DATA_LOADING_FAILED });
  }
};

export const deletePhrase = phrase => async dispatch => {
  dispatch({ type: DELETE_PHRASE, payload: phrase });
  const result = await api.deletePhrase(phrase);
};

export const deleteDictionary = ({ dictionary_name }) => async dispatch => {
  const user_id = getUserId(store.getState());
  const result = window.confirm(`Delete Forever?` +
    `\n\nThis will remove all phrases in "${dictionary_name}". This action cannot be undone. Sure?`);
  if (result) {
    dispatch({ type: DELETE_DICTIONARY, payload: dictionary_name });
    await api.deleteDictionary({ dictionary_name, user_id });
  }
};

export const updateDictionaryName = ({ old_name, new_name }) => async dispatch => {
  const user_id = getUserId(store.getState());
  dispatch({ type: UPDATE_DICTIONARY_NAME, old_name, new_name });
  const result = await api.updateDictionary({ old_name, new_name, user_id });
};
