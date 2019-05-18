import React, { Component } from 'react';
import { TabBar } from 'antd-mobile';
import './HomeTabBar.scss';
import { tabBarData } from './tabBarData';
import { connect } from 'react-redux';
import { changeTabBarKey } from '@/store/action/nav';
import classNames from 'classnames';

@connect(
  state => ({ tabBarSelectKey: state.nav.tabBarSelectKey }),
  { changeTabBarKey }
)
class HomeSegmentation extends Component {
  componentDidMount() {
    const { history, changeTabBarKey } = this.props;
    const { pathname } = history.location;
    const selectIndex = tabBarData.findIndex(item => item.path === pathname);
    if (selectIndex === -1) return;
    changeTabBarKey(tabBarData[selectIndex].key);
  }

  handleOnPress = (key, path) => {
    const { history, changeTabBarKey } = this.props;
    changeTabBarKey(key);
    history.push(path);
  };

  render() {
    const { tabBarSelectKey } = this.props;
    return (
      <div style={{ position: 'fixed', width: '100%', bottom: 0, zIndex: 1 }}>
        <TabBar unselectedTintColor="#949494" tintColor="#33A3F4" barTintColor="rgba(255,255,255,1)">
          {tabBarData.map(item => (
            <TabBar.Item
              icon={<i className={classNames('icon-style', 'iconfont', item.icon)} />}
              selectedIcon={
                <i className={classNames('icon-style', 'iconfont', item.icon)} style={{ color: '#33A3F4' }} />
              }
              title={item.title}
              key={item.key}
              selected={tabBarSelectKey === item.key}
              onPress={() => this.handleOnPress(item.key, item.path)}
            />
          ))}
        </TabBar>
      </div>
    );
  }
}

export default HomeSegmentation;
