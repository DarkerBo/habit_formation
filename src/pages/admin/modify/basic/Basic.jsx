import React, { Component } from 'react';
import styles from './Basic.module.scss';
import { Form, Input, Button, Icon, message } from 'antd';
import validateForm from '@/utils/form-validation';
import { modifyUserInfo } from '@/services/user';
import { connect } from 'react-redux';
import { saveUserInfoAction } from '@/store/action/user';

@connect(
  state => ({
    userInfo: state.user.userInfo,
  }),
  { saveUserInfoAction }
)
class ModifyBasic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: this.props.userInfo.nickname,
      imageFile: null, // 图片对象
    };
  }

  // 修改nickname输入框
  onChangeNickname = event => {
    this.setState({
      nickname: event.target.value,
    });
  };

  // 选择图片事件
  fileChange = event => {
    const file = event.target.files[0];
    this.setState({
      imageFile: file,
    });
  };

  // 图片渲染
  renderImage = () => {
    const { imageFile } = this.state;
    const { userInfo } = this.props;
    const imageSrc = userInfo ? userInfo.avatar : '';
    if (!!imageFile) {
      // 重新选择的头像
      return <img src={window.URL.createObjectURL(imageFile)} alt="头像" className={styles.pictureImg} />;
    } else if (imageSrc) {
      // 原来保存的头像
      return <img src={imageSrc} alt="头像" className={styles.pictureImg} />;
    } else {
      //默认头像
      return <Icon type="user" className={styles.pictureIcon} />;
    }
  };

  // 点击修改信息事件
  modifyMessage = async () => {
    const { nickname, imageFile } = this.state;
    const { saveUserInfoAction } = this.props;

    const validateNickname = [{ name: '昵称', require: true, value: nickname, maxLength: 15 }];
    const messageResult = validateForm(validateNickname);
    if (messageResult) return message.error(messageResult);

    const formData = new FormData();
    formData.append('nickname', nickname);
    formData.append('files', imageFile);

    const result = await modifyUserInfo(formData);
    if (result.data.code === '0') {
      await saveUserInfoAction();
      message.success('修改个人信息成功');
    } else {
      message.error(result.data.message);
    }
  };

  render() {
    const { nickname } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.basic}>
          <h2 className={styles.title}>修改管理员基本信息</h2>
          <div className={styles.formContainer}>
            <Form onSubmit={this.handleSubmit} className={styles.form}>
              <Form.Item label="修改昵称">
                <Input placeholder="nickname" allowClear value={nickname} onChange={this.onChangeNickname} />
              </Form.Item>
              <Form.Item label="修改头像">
                <label className={styles.view}>
                  <div className={styles.upload}>
                    <Icon type="cloud-upload" className={styles.uploadIcon} />
                    <p className={styles.uploadText}>点击上传图片</p>
                  </div>
                  {this.renderImage()}
                  <input type="file" name="file" id="file" style={{ display: 'none' }} onChange={this.fileChange} />
                </label>
              </Form.Item>
              <Form.Item>
                <div className={styles.btnGroup}>
                  <Button type="primary" htmlType="submit" className={styles.saveBtn} onClick={this.modifyMessage}>
                    保存
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

export default ModifyBasic;
