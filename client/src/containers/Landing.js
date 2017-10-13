import React, { Component } from 'react';
import { connect } from 'react-redux';
import FacebookLogin from 'react-facebook-login';
import * as actions from '../actions';

class Landing extends Component {
  render() {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: '#111',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img src={require('../assets/phrazes.png')} width={200} height={200} style={{ margin: 50 }}/>
        <FacebookLogin
          appId="672834932920089"
          fields="name,email"
          callback={response => {
            const token = response.accessToken;
            this.props.loginWithFacebook(token);
          }}
        />
      </div>
    );
  }
}

export default connect(null, actions)(Landing);
