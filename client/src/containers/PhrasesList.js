import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Phrase } from '../components';
import { getData, getUserId, getDataLoading } from '../reducers/selectors';
import styles from '../styles';
import * as config from '../utils/config';
import store from '../store';
import colors from '../styles/colors';
import {
  OPEN_ADD_NEW_MODAL,
  DELETE_PHRASE,
  SHARE_PHRASE,
  SHARE_ALL_PHRASES,
  SHARE_DICTIONARY,
  OPEN_PHRASE
} from '../actions/types';
import * as actions from '../actions';
import '../styles/phrases.css';

class PhrasesList extends Component {
  render() {
    return (
      <div className="phrases-list">
        <div className="phrases-list-wrap">
          {this.props.data.map(e => <Phrase data={e} />)}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: getData(state),
    data_loading: getDataLoading(state),
    user_id: getUserId(state)
  };
}

export default connect(mapStateToProps, actions)(PhrasesList);
