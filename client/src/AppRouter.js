import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Route } from 'react-router';
import { ConnectedRouter } from 'react-router-redux';
import store from './store';
import history from './store/history';
import { Header, App } from './containers';
import { Landing } from './components';
import './styles/style.css';

export default class AppRouter extends Component {
  render() {
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Route exact path='/' component={Landing} />
            <Route path='/app' component={App} />
          </div>
        </ConnectedRouter>
      </Provider>
    );
  }
}
