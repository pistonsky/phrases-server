import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login';
import * as actions from '../actions';
import { getUserId } from '../reducers/selectors';

import '../styles/landing.css';

class Landing extends Component {
  render() {
    return (
      <div className="landing">
        <header>
          <div className="navigation">
            <FacebookLogin
              appId="672834932920089"
              fields="name,email"
              callback={response => {
                const token = response.accessToken;
                this.props.loginWithFacebook(token);
              }}
              icon="fa-facebook-official"
              cssClass="facebook-login-button"
            />
            {this.props.logged_in
              ? <Link className="demo-button" to="/app">
                  Go To App
                </Link>
              : <button className="demo-button" onClick={() => {this.props.demoLogin()}}>
                  Try Demo
                </button>}
          </div>

          <div className="container-flex flex-row">
            <div className="header-title">
              <img alt="PHRAZES" src={require('../assets/phrazes.png')} />
              <div className="section-description">
                Learn <span className="desktop-only">languages</span> from
                locals.<br />Phraze by phraze.
              </div>
              <div className="beta-testing-signup-form-wrap" />
            </div>
            <div className="header-img">
              <div class="phone-img">
                <img
                  alt="header-phone"
                  src={require('../assets/screens/en1.png')}
                />
              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    logged_in: !!getUserId(state)
  };
}

export default connect(mapStateToProps, actions)(Landing);
