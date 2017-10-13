import React, { Component } from 'react';
import { connect } from 'react-redux';
import { default as Modal } from 'react-modal';
import FacebookLogin from 'react-facebook-login';
import { ActivityIndicator } from '../components';
import styles from '../styles';
import colors from '../styles/colors';
import { connectFacebook, ignoreConnectFacebook } from '../actions';
import {
  getUserId,
  getFacebookConnected,
  shouldShowConnectFacebookModal,
  facebookConnectInProgress
} from '../reducers/selectors';
import * as config from '../utils/config';

class ConnectFacebookModal extends Component {
  render() {
    return (
      <Modal
        isOpen={this.props.visible}
      >
        {this.props.in_progress ? (
          <div style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <div style={{ color: '#aaa', fontSize: 12, marginLeft: 10 }}>Logging you in...</div>
          </div>
        ) : (
          <div>
            <div style={styles.modalTitle}>Create an Account</div>
            <div style={styles.modalSubtitle}>
              So that you never loose your nasty phrazes!
            </div>
            <FacebookLogin
              appId={config.FACEBOOK_APP_ID}
              fields="name,email"
              callback={response => {
                const token = response.accessToken;
                this.props.connectFacebook({ user_id: this.props.user_id, token });
              }}
            />
            <button
              onClick={() => {
                this.props.ignoreConnectFacebook();
              }}
            >
              Not now
            </button>
          </div>
        )}
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowConnectFacebookModal(state),
    in_progress: facebookConnectInProgress(state),
    user_id: getUserId(state)
  };
}

export default connect(mapStateToProps, {
  connectFacebook,
  ignoreConnectFacebook
})(ConnectFacebookModal);
