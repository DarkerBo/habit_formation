import React, { Component } from 'react';
import { Toast } from 'antd-mobile';
import styles from './LoginRegister.module.scss';
import classNames from 'classnames';
import validateForm from '@/utils/form-validation';
import { login, register } from '@/services/user';
import { connect } from 'react-redux';
import { changeUserLoginStatus, saveUserInfoAction } from '@/store/action/user';

@connect(
  state => ({}),
  { changeUserLoginStatus, saveUserInfoAction }
)
class LoginRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: true, // 是否是进入登陆页面
      isLoginVisible: false, // 登陆密码框的值是否可见
      isRegisterVisible: false, // 注册密码框的值是否可见
      isRegisterReVisible: false, // 注册再次输入密码框的值是否可见
      account: '', // 账号
      password: '', // 密码
      rePassword: '', // 再次输入密码
    };
  }

  componentDidMount() {
    // 获取当前地址，然后渲染对应的登陆或注册页面
    const { history } = this.props;
    const { pathname } = history.location;
    this.setState({
      isLogin: pathname.includes('login'),
    });
  }

  // 改变密码框是否可见
  toggleVisible = key => {
    this.setState({
      [key]: !this.state[key],
    });
  };

  // 跳转页面
  clickEnter = () => {
    const { history } = this.props;
    const { isLogin } = this.state;
    const path = isLogin ? '/home/register' : '/home/login';
    this.setState({
      isLogin: !isLogin,
      account: '',
      password: '',
      rePassword: '',
    });
    history.push(path);
  };

  // 点击提交按钮事件
  clickSubmit = async () => {
    const { isLogin, account, password, rePassword } = this.state;
    const { saveUserInfoAction, changeUserLoginStatus, history } = this.props;

    // 登陆表单只需要验证账号格式，注册表单只需验证账号和密码格式
    if (isLogin) {
      // 登陆页面
      const validateAccount = [
        { name: '账号', require: true, value: account, type: 'account', minLength: 4, maxLength: 15 },
      ];
      const accountResult = validateForm(validateAccount);
      if (accountResult) return Toast.info(accountResult, 2);

      const req = { account, password, type: '0' };
      const result = await login(req);
      if (result.data.code === '0') {
        const data = result.data.data;
        window.localStorage.setItem('uid', data.id);
        window.localStorage.setItem('token', data.token);
        // 修改redux中userLogin的状态
        changeUserLoginStatus(true);
        await saveUserInfoAction();
        Toast.info('登陆成功', 2);
        history.push('/home/today');
      } else {
        Toast.info(result.data.message, 2);
      }
    } else {
      // 注册页面
      const validateMessage = [
        { name: '账号', require: true, value: account, type: 'account', minLength: 4, maxLength: 15 },
        { name: '密码', require: true, value: password, type: 'password', minLength: 6, maxLength: 15 },
      ];

      const messageResult = validateForm(validateMessage);
      if (messageResult) return Toast.info(messageResult, 2);

      const req = { account, password, rePassword };
      const result = await register(req);
      if (result.data.code === '0') {
        const data = result.data.data;
        window.localStorage.setItem('uid', data.id);
        window.localStorage.setItem('token', data.token);
        // 修改redux中userLogin的状态
        changeUserLoginStatus(true);
        await saveUserInfoAction();
        Toast.info('注册成功', 2);
        history.push('/home/today');
      } else {
        Toast.info(result.data.message, 2);
      }
    }
  };

  // 改变输入框的值
  changeValue = (key, event) => {
    this.setState({
      [key]: event.target.value,
    });
  };

  render() {
    const {
      isLogin,
      isLoginVisible,
      isRegisterVisible,
      isRegisterReVisible,
      account,
      password,
      rePassword,
    } = this.state;
    return (
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <img src={require('./read.jpg')} alt="封面" className={styles.image} />
        </div>
        <div className={styles.better}>要成为更加优秀的人</div>
        <div className={styles.start}>从一个个小习惯开始</div>

        {isLogin ? (
          // 登陆表单
          <div className={styles.inputContainer}>
            <div className={styles.inputItem}>
              <i className={classNames(styles.inputIcon, 'icon-mine', 'iconfont')} />
              <input
                type="text"
                name="loginAccount"
                placeholder="账号"
                className={styles.input}
                value={account}
                onChange={event => this.changeValue('account', event)}
              />
            </div>
            <div className={styles.inputItem}>
              <i className={classNames(styles.inputIcon, 'icon-3701mima', 'iconfont')} />
              <input
                type={isLoginVisible ? 'text' : 'password'}
                name="loginPassword"
                placeholder="密码"
                className={styles.input}
                value={password}
                onChange={event => this.changeValue('password', event)}
              />
              <i
                className={classNames(
                  styles.passwordIcon,
                  isLoginVisible ? 'icon-eye' : 'icon-eyeclose-fill',
                  'iconfont'
                )}
                onClick={() => this.toggleVisible('isLoginVisible')}
              />
            </div>
          </div>
        ) : (
          // 注册表单
          <div className={styles.inputContainer}>
            <div className={styles.inputItem}>
              <i className={classNames(styles.inputIcon, 'icon-mine', 'iconfont')} />
              <input
                type="text"
                name="registerAccount"
                placeholder="账号"
                className={styles.input}
                value={account}
                onChange={event => this.changeValue('account', event)}
              />
            </div>
            <div className={styles.inputItem}>
              <i className={classNames(styles.inputIcon, 'icon-3701mima', 'iconfont')} />
              <input
                type={isRegisterVisible ? 'text' : 'password'}
                name="registerPassword"
                placeholder="密码"
                className={styles.input}
                value={password}
                onChange={event => this.changeValue('password', event)}
              />
              <i
                className={classNames(
                  styles.passwordIcon,
                  isRegisterVisible ? 'icon-eye' : 'icon-eyeclose-fill',
                  'iconfont'
                )}
                onClick={() => this.toggleVisible('isRegisterVisible')}
              />
            </div>
            <div className={styles.inputItem}>
              <i className={classNames(styles.inputIcon, 'icon-3701mima', 'iconfont')} />
              <input
                type={isRegisterReVisible ? 'text' : 'password'}
                name="registerrePassword"
                placeholder="再次输入密码"
                className={styles.input}
                value={rePassword}
                onChange={event => this.changeValue('rePassword', event)}
              />
              <i
                className={classNames(
                  styles.passwordIcon,
                  isRegisterReVisible ? 'icon-eye' : 'icon-eyeclose-fill',
                  'iconfont'
                )}
                onClick={() => this.toggleVisible('isRegisterReVisible')}
              />
            </div>
          </div>
        )}

        {/* 底部操作按钮 + 跳转页面 */}
        <div className={styles.operate}>
          <div className={styles.buttonContainer} onClick={this.clickSubmit}>
            <div className={styles.operateButton}>{isLogin ? '登陆' : '注册'}</div>
          </div>

          <div className={styles.operateText} onClick={this.clickEnter}>
            点击进入{isLogin ? '注册' : '登陆'}页面>>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginRegister;
