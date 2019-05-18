import React, { Component } from 'react';
import styles from './AdminHeader.module.scss';
import { Icon, Dropdown, Menu, Modal, message } from 'antd';
import { connect } from 'react-redux';
import { changeMenuKey } from '@/store/action/nav';
import { changeAdminLoginStatus } from '@/store/action/user';

@connect(
  state => ({
    userInfo: state.user.userInfo,
  }),
  { changeMenuKey }
)
class AdminHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
    };
  }

  // 点击修改信息
  handleModify = () => {
    const { history, changeMenuKey } = this.props;
    changeMenuKey(['sub1']);
    history.push('/admin/modify/basic');
  };

  // 点击退出登陆
  clickLogout = () => {
    this.setState({
      isVisible: true,
    });
  };

  // 确认退出登陆
  logoutConfirm = event => {
    window.localStorage.setItem('uid', '');
    window.localStorage.setItem('token', '');
    changeAdminLoginStatus(false);
    this.setState({
      isVisible: false,
    });
    message.success('退出成功');
    window.location.reload();
  };

  // 取消退出登陆
  logoutCancel = event => {
    message.warning('已取消退出');
    this.setState({
      isVisible: false,
    });
  };

  render() {
    const { isVisible } = this.state;
    const { nickname } = this.props.userInfo;
    const { userInfo } = this.props;
    const imageSrc = userInfo ? userInfo.avatar : '';

    const menu = (
      <Menu>
        <Menu.Item onClick={this.handleModify}>
          <span>修改信息</span>
          &nbsp;&nbsp;
          <Icon type="edit" />
        </Menu.Item>

        <Menu.Item onClick={this.clickLogout}>
          <span>退出登陆</span>
          &nbsp;&nbsp;
          <Icon type="logout" />
        </Menu.Item>
      </Menu>
    );

    return (
      <div className={styles.container}>
        <div className={styles.nameContainer}>
          <Icon type="setting" className={styles.nameIcon} />
          <span className={styles.name}>后台管理系统</span>
        </div>
        <div className={styles.rightContainer}>
          <div className={styles.avatar}>
            {imageSrc ? (
              <img src={imageSrc} alt="图片" className={styles.image} />
            ) : (
              <Icon type="user" className={styles.icon} />
            )}
          </div>
          <Dropdown overlay={menu} placement="bottomCenter">
            <span className={styles.admin}>
              {nickname} &nbsp;
              <Icon type="caret-down" />
            </span>
          </Dropdown>
        </div>
        <Modal
          title="确认退出登陆框"
          visible={isVisible}
          onOk={this.logoutConfirm}
          onCancel={this.logoutCancel}
          okText="确定"
          cancelText="取消"
        >
          <p>确定退出后台管理页面吗？</p>
        </Modal>
      </div>
    );
  }
}

export default AdminHeader;
