import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { NavBar } from '../containers';
import { getUserId } from '../reducers/selectors';
import colors from '../styles/colors';

class Header extends Component {
  render() {
    if (this.props.logged_in) {
      if (this.props.current_route === '/') {
        return null;
      } else {
        return <NavBar />;
      }
    } else {
      return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    logged_in: getUserId(state) !== null,
    current_route: state.routing.location.pathname
  };
}

export default connect(mapStateToProps)(Header);
