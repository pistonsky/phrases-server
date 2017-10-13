import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { getUserId } from '../reducers/selectors';

class Header extends Component {
  render() {
    return (
      <div
        style={{
          height: 40,
          backgroundColor: 'black',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}
      >
        {this.props.logged_in && (this.props.current_route === '/') &&
          <Link to="/app" style={{ color: 'white', marginRight: 20, textDecoration: 'none' }}>
            GO TO APP ->
          </Link>}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    logged_in: true || getUserId(state) !== null,
    current_route: state.routing.location.pathname
  };
}

export default connect(mapStateToProps)(Header);
