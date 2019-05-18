import React, { Component } from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import validateForm from '@/utils/form-validation';
import styles from './Login.module.scss';
import { login } from '@/services/user';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { changeAdminLoginStatus, saveUserInfoAction } from '@/store/action/user';

@connect(
  state => ({}),
  { changeAdminLoginStatus, saveUserInfoAction }
)
class AdminLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '',
      password: '',
      accountState: '', // 账号输入框状态,error为错误警告
      accountHelp: '', // 账号错误警告文字提示
    };
  }

  // 登陆提交按钮事件
  handleSubmit = async event => {
    event.preventDefault();
    const { account, password } = this.state;
    const { history, changeAdminLoginStatus, saveUserInfoAction } = this.props;
    const validateAccount = [
      { name: '账号', require: true, value: account, type: 'account', minLength: 4, maxLength: 15 },
    ];

    // 如果账号有错误信息,则修改input框的状态和错误提示
    const accountResult = validateForm(validateAccount);
    if (accountResult) {
      this.setState({ accountState: 'error', accountHelp: accountResult });
      return;
    } else {
      // 如果没有错误信息，则设为正常提示，防止一开始格式不对，后面对了却仍然有错误信息
      this.setState({
        accountState: '',
        accountHelp: '',
      });
    }

    const req = { account, password, type: '1' };
    const result = await login(req);
    if (result.data.code === '0') {
      const data = result.data.data;
      window.localStorage.setItem('uid', data.id);
      window.localStorage.setItem('token', data.token);
      // 修改redux中adminLogin的状态
      changeAdminLoginStatus(true);
      await saveUserInfoAction();

      history.push('/admin/record');
    } else {
      message.error(result.data.message);
    }
  };

  render() {
    const { account, password, accountState, accountHelp } = this.state;
    const wrapClass = classNames(styles.wrap, styles.rounded);

    return (
      <div className={styles.container}>
        <div className={wrapClass}>
          <p className={styles.title}>欢迎登陆后台管理</p>

          <Form onSubmit={this.handleSubmit}>
            <Form.Item validateStatus={accountState} help={accountHelp}>
              <Input
                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Username"
                allowClear
                value={account}
                onChange={event => {
                  this.setState({ account: event.target.value });
                }}
              />
            </Form.Item>
            <Form.Item>
              <Input.Password
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                placeholder="Password"
                value={password}
                onChange={event => {
                  this.setState({ password: event.target.value });
                }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block disabled={!(account && password)}>
                Log in
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create({ name: 'admin_login' })(AdminLogin);
