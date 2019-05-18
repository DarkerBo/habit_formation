import React, { Component } from 'react';
import styles from './AdminNav.module.scss';
import { Menu, Icon } from 'antd';
import { menuItemData, menuSubData } from './menuData';
import { connect } from 'react-redux';
import { changeMenuKey } from '@/store/action/nav';

@connect(
  state => ({ navConfig: state.nav }),
  { changeMenuKey }
)
class AdminNav extends Component {
  componentDidMount() {
    // 刷新页面的时候获取当前地址，然后匹配到相应的selectedKeys
    const { history, changeMenuKey } = this.props;
    const { pathname } = history.location;
    const menuData = pathname.includes('modify') ? menuSubData : menuItemData;
    const selectIndex = menuData.findIndex(item => item.path === pathname);
    if (selectIndex === -1) return;
    const selectedKeys = [];
    selectedKeys.push(menuData[selectIndex].key);
    changeMenuKey(selectedKeys);
  }

  // 点击后跳转到相应路由
  handleClick = obj => {
    const { history, changeMenuKey } = this.props;
    const menuData = obj.key.includes('sub') ? menuSubData : menuItemData;

    const selectIndex = menuData.findIndex(item => item.key === obj.key);
    let selectedKeys = [];
    selectedKeys.push(menuData[selectIndex].key);
    changeMenuKey(selectedKeys);
    history.push(menuData[selectIndex].path);
  };

  render() {
    const { navConfig } = this.props;
    return (
      <div className={styles.container}>
        <Menu
          selectedKeys={navConfig.menuSelectKey}
          defaultOpenKeys={['sub']}
          mode="inline"
          theme="dark"
          style={{ height: '100%' }}
          onClick={this.handleClick}
        >
          {menuItemData.map(item => (
            <Menu.Item key={item.key}>
              <Icon type={item.icon} />
              <span>{item.name}</span>
            </Menu.Item>
          ))}
          <Menu.SubMenu
            key="sub"
            title={
              <span>
                <Icon type="edit" />
                <span>修改信息</span>
              </span>
            }
          >
            <Menu.Item key="sub1">基本信息</Menu.Item>
            <Menu.Item key="sub2">更改密码</Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </div>
    );
  }
}

export default AdminNav;
