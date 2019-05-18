import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import PropTypes from 'prop-types';
import asyncComponent from '@/common/hoc/AsyncComponent';
import HomeIntercept from './home-intercept';
import AdminIntercept from './admin-intercept';
import { connect } from 'react-redux';
import { getUserInfoAction } from '@/store/action/user';

const AdminLogin = asyncComponent(() => import('@/pages/admin/login/Login'));
const AdminIndex = asyncComponent(() => import('@/pages/admin/index/Index'));
const HomeIndex = asyncComponent(() => import('@/pages/home/index/Index'));
const ErrorPage = asyncComponent(() => import('@/pages/error-page/ErrorPage'));
const HomeMessageDetail = asyncComponent(() => import('@/pages/home/message-detail/MessageDetail'));
const HomeEditPersonalData = asyncComponent(() => import('@/pages/home/edit-personal-data/EditPersonalData'));
const HomeCreateHabit = asyncComponent(() => import('@/pages/home/create-habit/CreateHabit'));
const HomeCreateLog = asyncComponent(() => import('@/pages/home/create-log/CreateLog'));
const HomeLogDetail = asyncComponent(() => import('@/pages/home/log-detail/LogDetail'));
const HomeHabitDetail = asyncComponent(() => import('@/pages/home/habit-detail/HabitDetail'));
const HomeInvitation = asyncComponent(() => import('@/pages/home/invitation/Invitation'));
const HomeLoginRegister = asyncComponent(() => import('@/pages/home/login-register/LoginRegister'));
const HomeMySupervision = asyncComponent(() => import('@/pages/home/my-supervision/MySupervision'));
const HomeMyLogs = asyncComponent(() => import('@/pages/home/my-logs/MyLogs'));
const HomeAboutUs = asyncComponent(() => import('@/pages/home/about-us/AboutUs'));
const HomeRecordDetail = asyncComponent(() => import('@/pages/home/record-detail/RecordDetail'));

@connect(
  state => ({
    hasPullData: state.config.hasPullData,
    adminLogin: state.user.adminLogin,
    userLogin: state.user.userLogin,
  }),
  { getUserInfoAction }
)
class RouterComponent extends Component {
  componentDidMount() {
    const { adminLogin, userLogin, getUserInfoAction } = this.props;
    // 如果是已经登陆了，直接通过
    if (adminLogin || userLogin) return;
    getUserInfoAction();
  }

  render() {
    // 拉取用户信息后(无论是否存在)才渲染
    const { hasPullData } = this.props;

    return (
      hasPullData && (
        <Router>
          <Switch>
            <Route path="/home/(login|register)" component={HomeLoginRegister} />
            <Route path="/admin/login" component={AdminLogin} />
            <AdminIntercept path="/admin/:page" component={AdminIndex} />
            <HomeIntercept path="/home/:page" exact component={HomeIndex} />
            <HomeIntercept path="/home/message/:id" component={HomeMessageDetail} />
            <HomeIntercept path="/home/mine/edit" component={HomeEditPersonalData} />
            <HomeIntercept path="/home/habit/create" exact component={HomeCreateHabit} />
            <HomeIntercept path="/home/habit/create/:id" component={HomeCreateHabit} />
            <HomeIntercept path="/home/log/create" component={HomeCreateLog} />
            <HomeIntercept path="/home/log/detail/:id" component={HomeLogDetail} />
            <HomeIntercept path="/home/habit/detail/:id" component={HomeHabitDetail} />
            <HomeIntercept path="/home/habit/message/invitation/:id" component={HomeInvitation} />
            <HomeIntercept path="/home/mine/supervision" component={HomeMySupervision} />
            <HomeIntercept path="/home/mine/logs" component={HomeMyLogs} />
            <HomeIntercept path="/home/mine/about" component={HomeAboutUs} />
            <HomeIntercept path="/home/record/detail/:id" component={HomeRecordDetail} />
            <Route path="*" component={ErrorPage} />
          </Switch>
        </Router>
      )
    );
  }
}

export default RouterComponent;
