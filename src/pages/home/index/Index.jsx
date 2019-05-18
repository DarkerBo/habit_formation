import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import HomeTabBar from '@/components/home-tabbar/HomeTabBar';
import asyncComponent from '@/common/hoc/AsyncComponent';

const HomeToday = asyncComponent(() => import('@/pages/home/today/Today'));
const HomeRecord = asyncComponent(() => import('@/pages/home/record/Record'));
const HomeSquare = asyncComponent(() => import('@/pages/home/square/Square'));
const HomeMessage = asyncComponent(() => import('@/pages/home/message/Message'));
const HomeMine = asyncComponent(() => import('@/pages/home/mine/Mine'));

class HomeIndex extends Component {
  render() {
    const { history } = this.props;
    return (
      <div>
        <Switch>
          <Route path="/home/today" component={HomeToday} />
          <Route path="/home/record" component={HomeRecord} />
          <Route path="/home/square" component={HomeSquare} />
          <Route path="/home/message" exact component={HomeMessage} />
          <Route path="/home/mine" component={HomeMine} />
        </Switch>
        <HomeTabBar history={history} />
      </div>
    );
  }
}

export default HomeIndex;
