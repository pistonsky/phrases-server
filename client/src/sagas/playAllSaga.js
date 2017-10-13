import { takeEvery, select, call, put, race, take } from 'redux-saga/effects';
import { PLAY_ALL, OPEN_PHRASE, PLAY_PHRASE, CLOSE_PHRASE_MODAL, PLAYBACK_JUST_FINISHED } from '../actions/types';
import { getData } from '../reducers/selectors';

const playAllSaga = function* playAllSaga() {
  yield takeEvery(PLAY_ALL, playAll);
};

const playAll = function* playAll(action) {
  // create a randomized playlist made of current dictionary
  let playlist = [];
  let next;
  while (true) {
    if (playlist.length === 0) {
      playlist = yield call(createRandomizedPlaylist);
    }
    [ next ] = playlist.splice(0, 1);
    yield put({ type: OPEN_PHRASE, phrase: next });
    yield put({ type: PLAY_PHRASE, phrase: next });
    const { cancel, playbackJustFinished } = yield race({
      cancel: take(CLOSE_PHRASE_MODAL),
      playbackJustFinished: take(PLAYBACK_JUST_FINISHED)
    });
    if (cancel) break;
  }
};

const createRandomizedPlaylist = function* createRandomizedPlaylist() {
  let phrases = yield select(getData);
  let playlist = [];
  while (phrases.length) {
    const random_index = Math.floor(Math.random() * phrases.length);
    playlist.push(...phrases.splice(random_index, 1));
  }
  return playlist;
};

export default playAllSaga;
