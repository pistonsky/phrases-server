import React, { Component } from 'react';
import FacebookLogin from 'react-facebook-login';

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
          callback={response => console.log(response)}
        />
      </div>
    );
  }
}

export default Landing;
