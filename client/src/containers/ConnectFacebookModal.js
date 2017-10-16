import React, { Component } from 'react';
import { connect } from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import Loading from 'react-loading-animation';
import { loadD } from 'react-icons-kit/ionicons/loadD'; 
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

import '../styles/modal.css';

class ConnectFacebookModal extends Component {
  render() {
    return (
      <div
        className="modal"
        style={{
          display: this.props.visible ? 'block' : 'none'
        }}
      >
        {this.props.in_progress ? (
          <div className="modal-content">
            <Loading />
            <div style={{ fontSize: 12, color: '#ddd' }}>
              Logging you in...
            </div>
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
      </div>
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
