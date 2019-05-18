import React, { Component } from 'react';
import styles from './ErrorPage.module.scss';
import classNames from 'classnames';

class ErrorPage extends Component {
  render() {
    const isMobile = /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i.test(
      navigator.userAgent
    );
    return (
      <div className={styles.container}>
        <i className={classNames(isMobile ? styles.mobileIcon : styles.pcIcon, 'icon-kulian', 'iconfont')} />
        <div className={isMobile ? styles.mobileStatus : styles.pcStatus}>404</div>
        <div className={isMobile ? styles.mobileText : styles.pcText}>Page not found</div>
      </div>
    );
  }
}

export default ErrorPage;
