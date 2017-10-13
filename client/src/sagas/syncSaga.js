import { call, select, take, put } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { FileSystem } from 'expo';
import { RNS3 } from 'react-native-aws3';

import {
  getUserId,
  getOffline,
  anyUnsyncedPhrases,
  getUnsyncedPhrases
} from '../reducers/selectors';
import {
  ADD_NEW_PHRASE,
  UPDATE_PHRASE,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES,
  ADD_SHARED_DICTIONARY,
  PHRASE_UPLOADED,
  PHRASE_SYNCED,
  ALL_PHRASES_SYNCED
} from '../actions/types';
import * as config from '../utils/config';
import * as api from '../api';

const INTERVAL = 5000;

const syncSaga = function* syncSaga() {
  while (true) {
    // sync all unsynced phrases
    while (yield select(anyUnsyncedPhrases)) {
      (yield call(sync)) || (yield delay(INTERVAL));
    }
    yield put({ type: ALL_PHRASES_SYNCED });
    // wait for new or updated phrases
    yield take([ADD_NEW_PHRASE, UPDATE_PHRASE, ADD_SHARED_DICTIONARY, ADD_SHARED_PHRASES, ADD_SHARED_PHRASE]);
  }
};

const sync = function* sync() {
  const offline = yield select(getOffline);
  if (offline === true) {
    return false;
  } else {
    const unsynced = yield select(getUnsyncedPhrases);
    let sync_ok = true;
    for (let phrase of unsynced) {
      sync_ok = sync_ok && (yield call(syncPhrase, phrase));
    }
    return sync_ok;
  }
};

const syncPhrase = function* syncPhrase(phrase) {
  if ((yield call(uploadAudio, phrase)) && (yield call(uploadPhrase, phrase))) {
    yield put({ type: PHRASE_SYNCED, uri: phrase.uri });
    return true;
  } else {
    return false;
  }
};

const uploadAudio = function* uploadAudio(phrase) {
  if (phrase.uploaded) {
    return true;
  }
  const localUri = FileSystem.documentDirectory + phrase.uri + '.caf';
  try {
    const file = {
      uri: localUri,
      name: phrase.uri + '.caf',
      type: 'audio/x-caf'
    };
    const options = {
      keyPrefix: '',
      bucket: config.S3_BUCKET,
      region: config.S3_REGION,
      accessKey: config.S3_ACCESS_KEY,
      secretKey: config.S3_SECRET_KEY,
      successActionStatus: 201
    };
    const response = yield call(RNS3.put, file, options);
    if (response.status !== 201) {
      return false;
    } else {
      yield put({ type: PHRASE_UPLOADED, uri: phrase.uri });
      return true;
    }
  } catch (e) {
    return false;
  }
};

const uploadPhrase = function* uploadPhrase(phrase) {
  const user_id = yield select(getUserId);
  try {
    const result = yield call(api.addPhrase, phrase, user_id);
    if (result.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export default syncSaga;
