import { all, take, select, call, fork, put } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist/constants';
import { getUserId } from '../reducers/selectors';
import { push } from 'react-router-redux';
import { ROUTER_READY } from '../actions/types';

// import { syncSaga, shareSaga, audioSaga, playAllSaga } from './index';

export const startupSaga = function* startupSaga() {
  yield all([
    // take(ROUTER_READY),
    take(REHYDRATE)
  ]);

  // yield fork(shareSaga);
  // yield fork(audioSaga);
  // yield fork(playAllSaga);
  // yield call(syncSaga);
}
