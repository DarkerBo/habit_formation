import React, { Component } from 'react';
import styles from './Index.module.scss';
import AdminHeader from '@/components/admin-header/AdminHeader';
import AdminNav from '@/components/admin-nav/AdminNav';
import { Switch, Route, Redirect } from 'react-router-dom';
import asyncComponent from '@/common/hoc/AsyncComponent';

const AdminUser = asyncComponent(() => import('@/pages/admin/user/User'));
const AdminBanner = asyncComponent(() => import('@/pages/admin/banner/Banner'));
const AdminComment = asyncComponent(() => import('@/pages/admin/comment/Comment'));
const AdminHabit = asyncComponent(() => import('@/pages/admin/habit/Habit'));
const AdminModifyBasic = asyncComponent(() => import('@/pages/admin/modify/basic/Basic'));
const AdminModifyPassword = asyncComponent(() => import('@/pages/admin/modify/password/Password'));
const AdminRecord = asyncComponent(() => import('@/pages/admin/record/Record'));
const AdminSquare = asyncComponent(() => import('@/pages/admin/square/Square'));

class AdminIndex extends Component {
  render() {
    const { history } = this.props;

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <AdminHeader history={history} />
        </div>
        <div className={styles.wrap}>
          <div className={styles.nav}>
            <AdminNav history={history} />
          </div>
          <div className={styles.content}>
            <Switch>
              <Route path="/admin/user" component={AdminUser} />
              <Route path="/admin/banner" component={AdminBanner} />
              <Route path="/admin/comment" component={AdminComment} />
              <Route path="/admin/habit" component={AdminHabit} />
              <Route path="/admin/modify/basic" component={AdminModifyBasic} />
              <Route path="/admin/modify/password" component={AdminModifyPassword} />
              <Route path="/admin/record" component={AdminRecord} />
              <Route path="/admin/square" component={AdminSquare} />
              <Redirect to="/404" />
            </Switch>
          </div>
        </div>
      </div>
    );
  }
}

export default AdminIndex;
