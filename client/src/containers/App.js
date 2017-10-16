import React, { Component } from 'react';
import { connect } from 'react-redux';
import { PhrasesList } from '../containers';

// import '../index.css';

class App extends Component {
  render() {
    return (
      <PhrasesList />
    );
  }
}

function mapStateToProps(state) {
  return {};
}

export default connect(mapStateToProps)(App);
