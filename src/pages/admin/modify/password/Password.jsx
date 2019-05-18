import React, { Component } from 'react';
import styles from './Password.module.scss';
import { Form, Input, Button, message } from 'antd';
import { connect } from 'react-redux';
import validateForm from '@/utils/form-validation';
import { modifyPassword } from '@/services/user';

@connect(state => ({
  userInfo: state.user.userInfo,
}))
class ModifyPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '', //原密码
      newPassword: '', //新密码
      newRePassword: '', //再次输入的新密码
    };
  }

  // 点击重置按钮事件
  resetPassword = () => {
    this.setState({
      password: '',
      newPassword: '',
      newRePassword: '',
    });
  };

  // 输入框值改变
  onChangeValue = (key, event) => {
    this.setState({
      [key]: event.target.value,
    });
  };

  // 点击确认修改密码模态框
  clickSavePassword = async () => {
    const { password, newPassword, newRePassword } = this.state;

    const validateMessage = [
      { name: '原密码', require: true, value: password },
      { name: '新密码', require: true, value: newPassword, minLength: 6, maxLength: 15 },
    ];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return message.error(messageResult);
    if (newPassword !== newRePassword) return message.error('两次输入的新密码不一致');

    const req = { password, newPassword };
    const result = await modifyPassword(req);
    if (result.data.code === '0') {
      message.success('修改密码成功');
    } else {
      return message.error(result.data.message);
    }

    this.setState({
      password: '',
      newPassword: '',
      newRePassword: '',
    });
  };

  render() {
    const { password, newPassword, newRePassword } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.password}>
          <h2 className={styles.title}>修改管理员密码</h2>
          <div className={styles.formContainer}>
            <Form>
              <Form.Item label="原密码">
                <Input.Password
                  placeholder="old password"
                  value={password}
                  onChange={event => this.onChangeValue('password', event)}
                />
              </Form.Item>
              <Form.Item label="新密码">
                <Input.Password
                  placeholder="new password"
                  value={newPassword}
                  onChange={event => this.onChangeValue('newPassword', event)}
                />
              </Form.Item>
              <Form.Item label="确认新密码">
                <Input.Password
                  placeholder="new password again"
                  value={newRePassword}
                  onChange={event => this.onChangeValue('newRePassword', event)}
                />
              </Form.Item>
              <Form.Item>
                <div className={styles.btnGroup}>
                  <Button type="primary" htmlType="submit" className={styles.saveBtn} onClick={this.clickSavePassword}>
                    保存
                  </Button>
                  <Button className={styles.resetBtn} onClick={this.resetPassword}>
                    重置
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    );
  }
}

export default ModifyPassword;
