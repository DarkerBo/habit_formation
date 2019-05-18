import React, { Component } from 'react';
import { NavBar, Icon } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './AboutUs.module.scss';
import classNames from 'classnames';

class AboutUs extends Component {
  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    return (
      <div className={styles.container}>
        <NavBar
          mode="dark"
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          关于我们
        </NavBar>
        <div className={styles.avatar}>
          <i className={classNames(styles.icon, 'icon-cat', 'iconfont')} />
        </div>
        <div className={styles.nickname}>Bowen</div>
        <div className={styles.motto}>不辜负自己的，才是人生啊。</div>
      </div>
    );
  }
}

export default AboutUs;
