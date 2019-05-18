import React, { Component } from 'react';
import { Modal } from 'antd-mobile';
import styles from './PasswordModal.module.scss';
import './PasswordModal.scss';

class PasswordModal extends Component {
  // 点击取消按钮事件
  onClose = () => {
    this.props.onCloseModal();
  };

  // 点击确认按钮事件
  onConfirm = () => {
    this.props.onConfirmModal();
  };

  // 输入框值改变
  onChangeValue = (key, event) => {
    this.props.onChangeModalValue(key, event.target.value);
  };

  // 阻止ios的默认事件
  closest = (el, selector) => {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;
    while (el) {
      if (matchesSelector.call(el, selector)) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };

  // 阻止ios的默认事件
  onWrapTouchStart = e => {
    // fix touch to scroll background page on iOS
    if (!/iPhone|iPod|iPad/i.test(navigator.userAgent)) {
      return;
    }
    const pNode = this.closest(e.target, '.am-modal-content');
    if (!pNode) {
      e.preventDefault();
    }
  };

  render() {
    const { isVisible, password, newPassword, newRePassword } = this.props;

    return (
      <Modal
        visible={isVisible}
        transparent
        maskClosable={false}
        onClose={this.onClose}
        title="修改密码"
        wrapProps={{ onTouchStart: this.onWrapTouchStart }}
        className="passwordModal"
      >
        <div className={styles.inputContainer}>
          <input
            type="password"
            name="password"
            className={styles.password}
            placeholder="请输入原密码"
            value={password}
            onChange={event => this.onChangeValue('password', event)}
          />
          <input
            type="password"
            name="newpassword"
            className={styles.password}
            placeholder="请输入新密码"
            value={newPassword}
            onChange={event => this.onChangeValue('newPassword', event)}
          />
          <input
            type="password"
            name="renewpassword"
            className={styles.password}
            placeholder="请再次输入新密码"
            value={newRePassword}
            onChange={event => this.onChangeValue('newRePassword', event)}
          />
        </div>
        <div className={styles.passwordBtnGroup}>
          <div className={styles.cancelBtn} onClick={this.onClose}>
            取消
          </div>
          <div className={styles.confirmBtn} onClick={this.onConfirm}>
            修改
          </div>
        </div>
      </Modal>
    );
  }
}

export default PasswordModal;
