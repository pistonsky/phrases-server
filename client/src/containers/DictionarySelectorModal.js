import React, { Component } from 'react';
import { connect } from 'react-redux';
import { default as Modal } from 'react-modal';
import {
  getDictionaries,
  shouldShowDictionariesSelectorModal,
  getUserId
} from '../reducers/selectors';
import styles from '../styles';
import colors from '../styles/colors';
import store from '../store';
import {
  ADD_DICTIONARY,
  SELECT_DICTIONARY,
  TOGGLE_DICTIONARY_SELECTOR
} from '../actions/types';
import { smartFontSize } from '../utils/functions';
import * as actions from '../actions';

import '../styles/dictionary-selector-modal.css';

class DictionarySelectorModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return (
      <div
        className="dictionary-selector-modal"
        style={{
          top: this.props.visible ? '0%' : '200%'
        }}
      >
        <div
          className="dictionary-selector-modal-header"
          style={{
            backgroundColor: colors.secondary
          }}
        >
          <div
            className="dictionary-selector-modal-header-text"
            style={{ color: colors.white }}
          >
            Choose
          </div>
          <div
            className="dictionary-selector-modal-header-cancel"
            onClick={() => store.dispatch({ type: TOGGLE_DICTIONARY_SELECTOR })}
          >
            <div
              style={{
                color: colors.primary_dark
              }}
            >
              Close
            </div>
          </div>
        </div>
        <div
          style={{
            overflowY: 'scroll',
            height: '100%'
          }}
        >
          <div>
            {this.props.dictionaries.map(e =>
              <div
                className="dictionary-selector-modal-item"
                style={{
                  color: e.selected ? colors.primary : colors.white
                }}
                onClick={() => {
                  store.dispatch({
                    type: SELECT_DICTIONARY,
                    name: e.name
                  });
                }}
              >
                {e.name}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowDictionariesSelectorModal(state),
    dictionaries: getDictionaries(state),
    user_id: getUserId(state)
  };
}

export default connect(mapStateToProps, actions)(DictionarySelectorModal);
