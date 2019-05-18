import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

@connect(state => ({
  userLogin: state.user.userLogin,
}))
class HomeIntercept extends Component {
  render() {
    const { userLogin, ...rest } = this.props;
    return userLogin ? <Route {...rest} /> : <Redirect to="/home/login" />;
  }
}

export default HomeIntercept;
