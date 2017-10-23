import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FacebookLogin from 'react-facebook-login';
import * as actions from '../actions';
import { getUserId } from '../reducers/selectors';

import '../styles/landing.css';

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slide: 0
    }
  }

  componentDidMount() {
    this.interval = window.setInterval(() => this.setState({ slide: (this.state.slide + 1) % 5 }), 3000);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }
  
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
              <a href="https://itunes.apple.com/us/app/phrazes/id1288908502?ls=1&mt=8" target="_blank">
                <img alt="Download on the App Store" src={require('../assets/Download_on_the_App_Store_Badge_US-UK_135x40.svg')} />
              </a>
            </div>
            <div className="header-img">
              <div className="phone-img">
                <div className="phone-img-container">
                  <img
                    alt="header-phone"
                    src={require('../assets/screens/en1.png')}
                    style={{
                      opacity: this.state.slide === 0 ? 1 : 0
                    }}
                  />
                  <img
                    alt="header-phone"
                    src={require('../assets/screens/en2.png')}
                    style={{
                      opacity: this.state.slide === 1 ? 1 : 0
                    }}
                  />
                  <img
                    alt="header-phone"
                    src={require('../assets/screens/en3.png')}
                    style={{
                      opacity: this.state.slide === 2 ? 1 : 0
                    }}
                  />
                  <img
                    alt="header-phone"
                    src={require('../assets/screens/en4.png')}
                    style={{
                      opacity: this.state.slide === 3 ? 1 : 0
                    }}
                  />
                  <img
                    alt="header-phone"
                    src={require('../assets/screens/en5.png')}
                    style={{
                      opacity: this.state.slide === 4 ? 1 : 0
                    }}
                  />
                </div>
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
