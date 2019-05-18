import React, { Component } from 'react';
import styles from './Banner.module.scss';
import { Input, Icon, Button, Form, message } from 'antd';
import validateForm from '@/utils/form-validation';
import { getBannerInfo, createOrEditBanner } from '@/services/banner';

class AdminBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageFile: null, // 图片对象
      bannerInfo: null, //公告图信息
      author: '', // 公告出处
      content: '', // 公告内容
    };
  }

  componentDidMount() {
    this.getBannerInfo();
  }

  // 获取公告图信息
  getBannerInfo = async () => {
    const result = await getBannerInfo();
    if (result.data.code === '1') return message.error(result.data.message);
    const bannerInfo = result.data.data[0];
    this.setState({
      bannerInfo,
      author: bannerInfo ? bannerInfo.author : '',
      content: bannerInfo ? bannerInfo.content : '',
    });
  };

  // 点击提交按钮事件
  handleSubmit = async () => {
    const { author, content, imageFile } = this.state;

    const validateMessage = [
      { name: '出处', require: true, value: author },
      { name: '公告内容', require: true, value: content },
    ];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return message.error(messageResult);

    const formData = new FormData();
    formData.append('author', author);
    formData.append('content', content);
    formData.append('picture', imageFile);

    const result = await createOrEditBanner(formData);
    if (result.data.code === '0') {
      message.success('保存公告图成功');
    } else {
      message.error(result.data.message);
    }
  };

  // 改变作品出处的值
  onChangeAuthor = e => {
    this.setState({
      author: e.target.value,
    });
  };

  // 改变公告内容
  onChangeContent = e => {
    this.setState({
      content: e.target.value,
    });
  };

  // 选择图片事件
  fileChange = event => {
    const file = event.target.files[0];
    this.setState({
      imageFile: file,
    });
  };

  // 删除选择图片事件
  clearImage = () => {
    this.setState({
      imageFile: null,
    });
  };

  // 图片渲染
  renderImage = () => {
    const { imageFile, bannerInfo } = this.state;
    const imageSrc = bannerInfo ? bannerInfo.picture : '';
    if (!!imageFile) {
      // 重新选择的公告图
      return <img src={window.URL.createObjectURL(imageFile)} alt="头像" className={styles.pictureImg} />;
    } else if (imageSrc) {
      // 原来保存的公告图
      return <img src={bannerInfo.picture} alt="头像" className={styles.pictureImg} />;
    } else {
      //默认公告图
      return <Icon type="file-unknown" className={styles.pictureIcon} />;
    }
  };

  render() {
    const { imageFile, author, content } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.banner}>
          <h2 className={styles.title}>首页公告图展示</h2>
          <div className={styles.formContianer}>
            <Form className={styles.form}>
              <Form.Item label="作者或作品：" className={styles.formItem}>
                <Input placeholder="source" className={styles.input} value={author} onChange={this.onChangeAuthor} />
              </Form.Item>

              <Form.Item label="公告内容：">
                <Input.TextArea rows={3} className={styles.textarea} value={content} onChange={this.onChangeContent} />
              </Form.Item>

              <Form.Item label="公告插图">
                <div className={styles.imageContainer}>
                  <label className={styles.view}>
                    <div className={styles.upload}>
                      <Icon type="cloud-upload" className={styles.uploadIcon} />
                      <p className={styles.uploadText}>点击上传图片</p>
                    </div>

                    {this.renderImage()}
                    <input type="file" name="file" id="file" style={{ display: 'none' }} onChange={this.fileChange} />
                  </label>
                  {imageFile && (
                    <div className={styles.deleteIconContainer} onClick={this.clearImage}>
                      <Icon type="close-circle" theme="filled" className={styles.deleteIcon} />
                    </div>
                  )}
                </div>
              </Form.Item>

              <Form.Item>
                <div className={styles.btnGroup}>
                  <Button type="primary" htmlType="submit" className={styles.saveBtn} onClick={this.handleSubmit}>
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

export default AdminBanner;
