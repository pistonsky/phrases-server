import React, { Component } from 'react';
import { connect } from 'react-redux';
import Icon from 'react-icons-kit';
import { chevronDown } from 'react-icons-kit/fa/chevronDown';
import store from '../store';
import { TOGGLE_DICTIONARY_SELECTOR } from '../actions/types';
import colors from '../styles/colors';
import { getCurrentDictionaryName } from '../reducers/selectors';
import { smartFontSize } from '../utils/functions';

class DictionarySelector extends Component {
  render() {
    return (
      <div
        className='dictionary-selector'
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          height: '100%',
          cursor: 'pointer'
        }}
        onClick={() => store.dispatch({ type: TOGGLE_DICTIONARY_SELECTOR })}
      >
        <div
          style={{
            fontSize: smartFontSize({
              min: 14,
              max: 18,
              threshold: 18,
              text: this.props.dictionary
            }),
            marginRight: 5,
            color: colors.white,
            textAlign: 'center'
          }}
        >
          {this.props.dictionary}
        </div>
        <Icon
          icon={chevronDown}
          size={12}
          color={colors.white}
          style={{
            position: 'relative',
            top: smartFontSize({
              min: 1,
              max: 2,
              threshold: 18,
              text: this.props.dictionary
            }),
            color: colors.white
          }}
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    dictionary: getCurrentDictionaryName(state)
  };
}

export default connect(mapStateToProps)(DictionarySelector);
