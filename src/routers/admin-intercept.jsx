import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

@connect(state => ({
  adminLogin: state.user.adminLogin,
}))
class AdminIntercept extends Component {
  render() {
    const { adminLogin, ...rest } = this.props;
    return adminLogin ? <Route {...rest} /> : <Redirect to="/admin/login" />;
  }
}

export default AdminIntercept;
