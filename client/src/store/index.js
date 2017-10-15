import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist';
import { routerMiddleware } from 'react-router-redux';
import reducers from '../reducers';
import * as actions from '../actions';
import { startupSaga } from '../sagas';
import history from './history';

const router = routerMiddleware(history);

const saga = createSagaMiddleware();

const store = createStore(
  reducers,
  actions,
  compose(
    applyMiddleware(saga),
    applyMiddleware(thunk),
    autoRehydrate(),
    applyMiddleware(router)
  )
);

persistStore(store, { whitelist: ['main', 'auth', 'analytics', 'form'] });

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextRootReducer = require('../reducers/index');
    store.replaceReducer(nextRootReducer);
  });
}

saga.run(startupSaga);

export default store;

window.store = store;
