import React, { Component } from 'react';
import { connect } from 'react-redux';
import { DictionarySelector } from '../containers';
import styles from '../styles';
import colors from '../styles/colors';
import { OPEN_ADD_NEW_MODAL, PLAY_ALL } from '../actions/types';
import store from '../store';
import { getData } from '../reducers/selectors';

class NavBar extends Component {
  render() {
    return (
      <div className='nav-bar' style={styles.navBarStyle}>
        <DictionarySelector />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: getData(state)
  };
}

export default connect(mapStateToProps)(NavBar);
