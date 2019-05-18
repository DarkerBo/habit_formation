import React, { Component } from 'react';
import { NavBar, Icon, List, Modal, Picker, TextareaItem, Toast } from 'antd-mobile';
import styles from './EditPersonalData.module.scss';
import '@/assets/styles/navbar.scss';
import PasswordModal from '@/components/password-modal/PasswordModal';
import classNames from 'classnames';
import { connect } from 'react-redux';
import validateForm from '@/utils/form-validation';
import { modifyUserInfo, modifyPassword } from '@/services/user';
import { saveUserInfoAction } from '@/store/action/user';

@connect(
  state => ({
    userInfo: state.user.userInfo,
  }),
  { saveUserInfoAction }
)
class EditPersonalData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageFile: null, // 头像图片对象
      backgroundImageFile: null, // 背景图片对象
      pickerValue: [this.props.userInfo.sex], // 性别
      isVisible: false, // 是否显示修改密码模态框
      motto: this.props.userInfo.motto || '', // 座右铭
      nickname: this.props.userInfo.nickname, // 昵称
      password: '', //原密码
      newPassword: '', //新密码
      newRePassword: '', //再次输入的新密码
    };
  }

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  // 选择头像图片事件
  fileChange = event => {
    const file = event.target.files[0];
    this.setState({
      imageFile: file,
    });
  };

  // 头像图片渲染
  renderImage = () => {
    const { imageFile } = this.state;
    const { userInfo } = this.props;
    const imageSrc = userInfo ? userInfo.avatar : '';
    if (!!imageFile) {
      // 重新选择的头像
      return <img src={window.URL.createObjectURL(imageFile)} alt="头像" className={styles.image} />;
    } else if (imageSrc) {
      // 原来保存的头像
      return <img src={imageSrc} alt="头像" className={styles.image} />;
    } else {
      //默认头像
      return <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />;
    }
  };

  // 选择背景图片事件
  fileBackgroundChange = event => {
    const file = event.target.files[0];
    this.setState({
      backgroundImageFile: file,
    });
  };

  // 背景图片渲染
  renderBackgroundImage = () => {
    const { backgroundImageFile } = this.state;
    const { userInfo } = this.props;
    const imageSrc = userInfo ? userInfo.background_image : '';
    if (!!backgroundImageFile) {
      // 重新选择的背景图片
      return <img src={window.URL.createObjectURL(backgroundImageFile)} alt="背景图片" className={styles.image} />;
    } else if (imageSrc) {
      // 原来保存的背景图片
      return <img src={imageSrc} alt="头像" className={styles.image} />;
    } else {
      //默认背景图片
      return <i className={classNames(styles.userIcon, 'icon-picture', 'iconfont')} />;
    }
  };

  // picker点击确定事件
  handleOnPickerOk = value => {
    this.setState({
      pickerValue: value,
    });
  };

  // 点击修改事件
  modifyMessage = async () => {
    const { nickname, pickerValue, motto, imageFile, backgroundImageFile } = this.state;
    const { saveUserInfoAction, history } = this.props;

    const validateMessage = [
      { name: '昵称', require: true, value: nickname, maxLength: 15 },
      { name: '座右铭', value: motto, maxLength: 60 },
    ];
    const messageResult = validateForm(validateMessage);

    if (messageResult) return Toast.info(messageResult, 1);

    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('sex', pickerValue[0]);
    formData.append('motto', motto);
    formData.append('files', imageFile);
    formData.append('backgroundFiles', backgroundImageFile);

    const result = await modifyUserInfo(formData);
    if (result.data.code === '0') {
      await saveUserInfoAction();
      Toast.info('修改个人信息成功', 2);
      history.push('/home/mine');
    } else {
      Toast.info(result.data.message, 2);
    }
  };

  // 修改昵称
  onNicknameChange = () => {
    const { nickname } = this.state;

    setTimeout(() => {
      Modal.prompt(
        '请修改你的昵称',
        '',
        [
          {
            text: '取消',
            onPress: () =>
              new Promise(resolve => {
                setTimeout(() => {
                  resolve();
                }, 0);
              }),
          },
          {
            text: '确定',
            onPress: value =>
              new Promise((resolve, reject) => {
                setTimeout(() => {
                  const validateNickname = [{ name: '昵称', require: true, value, minLength: 1, maxLength: 15 }];
                  const messageResult = validateForm(validateNickname);
                  if (messageResult) {
                    reject();
                    return Toast.info(messageResult, 1);
                  }
                  resolve();
                  this.setState({
                    nickname: value,
                  });
                }, 0);
              }),
          },
        ],
        'default',
        nickname
      );
    });
  };

  // 修改座右铭
  mottoChangeValue = value => {
    this.setState({
      motto: value,
    });
  };

  // 点击修改密码
  onPasswordChange = () => {
    this.setState({
      isVisible: true,
    });
  };

  // 关闭修改密码模态框
  onClosePswModal = () => {
    this.setState({
      password: '',
      newPassword: '',
      newRePassword: '',
      isVisible: false,
    });
  };

  // 点击确认修改密码模态框
  onConfirmPswModal = async () => {
    const { password, newPassword, newRePassword } = this.state;

    const validateMessage = [
      { name: '原密码', require: true, value: password },
      { name: '新密码', require: true, value: newPassword, minLength: 6, maxLength: 15 },
    ];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return Toast.info(messageResult, 1);
    if (newPassword !== newRePassword) return Toast.info('两次输入的新密码不一致', 1);

    const req = { password, newPassword };
    const result = await modifyPassword(req);
    if (result.data.code === '0') {
      Toast.info('修改密码成功', 2);
    } else {
      return Toast.info(result.data.message, 2);
    }

    this.setState({
      password: '',
      newPassword: '',
      newRePassword: '',
      isVisible: false,
    });
  };

  // 改变密码输入框的值
  onChangePassword = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  render() {
    const { pickerValue, isVisible, motto, nickname, password, newPassword, newRePassword } = this.state;

    const pickerData = [
      {
        value: '0',
        label: '保密',
        children: [],
      },
      {
        value: '1',
        label: '男',
        children: [],
      },
      {
        value: '2',
        label: '女',
        children: [],
      },
    ];
    return (
      <div className={styles.container}>
        {/* 顶部栏 */}
        <NavBar
          mode="dark"
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          rightContent={<div onClick={this.modifyMessage}>修改</div>}
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          个人资料
        </NavBar>

        {/* 修改个人头像 */}
        <List className={classNames(styles.operation, 'avatarOperation')}>
          <List.Item
            arrow="horizontal"
            className={styles.avatarItem}
            extra={<div className={styles.avatar}>{this.renderImage()}</div>}
          >
            修改头像
          </List.Item>
          <input type="file" name="avatarFile" className={styles.fileInput} onChange={this.fileChange} />
        </List>

        {/* 修改背景图片 */}
        <List className={classNames(styles.operation, 'avatarOperation')}>
          <List.Item
            arrow="horizontal"
            className={styles.avatarItem}
            extra={<div className={styles.background}>{this.renderBackgroundImage()}</div>}
          >
            修改背景
          </List.Item>
          <input
            type="file"
            name="backgroundImageFile"
            className={styles.fileInput}
            onChange={this.fileBackgroundChange}
          />
        </List>

        {/* 修改个人资料 */}
        <List className={styles.operation} style={{ touchAction: 'none' }}>
          <List.Item arrow="horizontal" extra={nickname} onClick={this.onNicknameChange}>
            我的昵称
          </List.Item>
          <Picker data={pickerData} cols={1} value={pickerValue} onOk={this.handleOnPickerOk}>
            <List.Item onClick={() => {}} arrow="horizontal" extra={pickerValue}>
              性别
            </List.Item>
          </Picker>
          <TextareaItem
            labelNumber={5}
            title="座右铭"
            placeholder="输入想对自己说的话吧"
            data-seed="mottoId"
            autoHeight
            value={motto}
            onChange={this.mottoChangeValue}
            className={styles.motto}
            count={60}
          />
          <List.Item onClick={this.onPasswordChange} arrow="horizontal">
            修改密码
          </List.Item>
        </List>

        {/* 修改密码模态框 */}
        <PasswordModal
          isVisible={isVisible}
          onCloseModal={this.onClosePswModal}
          onConfirmModal={this.onConfirmPswModal}
          password={password}
          newPassword={newPassword}
          newRePassword={newRePassword}
          onChangeModalValue={this.onChangePassword}
        />
      </div>
    );
  }
}

export default EditPersonalData;
