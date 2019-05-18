import React, { Component } from 'react';
import { NavBar, Icon, TextareaItem, List, Switch, Picker, Toast } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './CreateLog.module.scss';
import classNames from 'classnames';
import validateForm from '@/utils/form-validation';
import { getTodayIsClock } from '@/services/clock';
import { createLog } from '@/services/log';

class CreateLog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imageFiles: [], // 存储图片对象的数组
      imageKey: 0, // 保持存储图片的对象的key值一直为最新
      checked: false, // 是否设为私密
      habitValue: [], // 已打卡习惯下拉框
      textareaValue: '', // 日志内容
      habitData: [], //今天已打卡的习惯数组
    };
  }

  componentDidMount() {
    this.getIsClockHabit();
  }

  // 获取今天已打卡的习惯
  getIsClockHabit = async () => {
    const req = { status: '1' };
    const result = await getTodayIsClock(req);
    if (result.data.code === '1') return Toast.info(result.data.message, 1);
    const clockData = result.data.data;
    const habitData = clockData.map(item => {
      return { value: item.habit_id, label: item.name, children: [] };
    });
    this.setState({
      habitData,
    });
  };

  // 点击完成事件
  finishLog = async () => {
    const { history } = this.props;
    const { checked, habitValue, textareaValue, imageFiles } = this.state;
    const private_log = checked ? '1' : '0';

    const validateMessage = [{ name: '日志内容', require: true, value: textareaValue, maxLength: 150 }];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return Toast.info(messageResult, 1);

    // 如果没有选择已打卡的习惯，不能创建
    if (!habitValue[0]) return Toast.info('要有今天已打卡的习惯才可以创建日志~', 1);

    const formData = new FormData();
    formData.append('content', textareaValue);
    formData.append('private_log', private_log);
    formData.append('topping', '0');
    formData.append('habit_id', habitValue[0]);
    for (const image of imageFiles) {
      formData.append('picture', image.file);
    }

    const result = await createLog(formData);
    if (result.data.code === '0') {
      Toast.info('新建日志成功', 1);
      history.push('/home/square');
    } else {
      return Toast.info(result.data.message, 1);
    }
  };

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  // 选择图片事件
  fileChange = event => {
    let { imageFiles, imageKey } = this.state;
    const files = event.target.files;
    if (imageFiles.length + files.length > 6) {
      Toast.info('图片选择数量不能大于6', 1);
      return;
    }
    let filesArr = [];
    for (let i = 0; i < files.length; i++) {
      imageKey += 1;
      let fileObj = { key: imageKey, file: files[i] };
      filesArr.push(fileObj);
    }
    this.setState({
      imageFiles: [...imageFiles, ...filesArr],
      imageKey,
    });
  };

  // 选择习惯的picker的ok事件
  onHabitPickerOk = value => {
    this.setState({
      habitValue: value,
    });
  };

  // 改变滑动开关状态
  toggleChecked = () => {
    this.setState({
      checked: !this.state.checked,
    });
  };

  // 删除图片
  deleteImage = key => {
    const { imageFiles } = this.state;
    const deleteIndex = imageFiles.findIndex(item => (item.key = key));
    imageFiles.splice(deleteIndex, 1);
    this.setState({
      imageFiles,
    });
  };

  // 改变输入框的值事件
  changeValue = value => {
    this.setState({
      textareaValue: value,
    });
  };

  render() {
    const { imageFiles, checked, habitValue, textareaValue, habitData } = this.state;

    return (
      <div className={styles.container}>
        {/* 顶部栏 */}
        <NavBar
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          rightContent={<div onClick={this.finishLog}>完成</div>}
          mode="dark"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          新建日志
        </NavBar>
        <TextareaItem
          placeholder="这一刻的想法..."
          data-seed="logId"
          rows={8}
          count={150}
          value={textareaValue}
          onChange={this.changeValue}
        />

        {/* 照片墙 */}
        <div className={styles.imageWallContainer}>
          {imageFiles.map((item, index) => (
            <div className={styles.imageWallItem} key={index}>
              <img src={window.URL.createObjectURL(item.file)} alt="图片" className={styles.image} />
              <i
                className={classNames(styles.deleteIcon, 'icon-shanchu', 'iconfont')}
                onClick={() => this.deleteImage(item.key)}
              />
            </div>
          ))}

          {imageFiles.length < 6 && (
            <div className={styles.addImage}>
              <i className={classNames(styles.plusIcon, 'icon-plus', 'iconfont')} />
              <input type="file" name="file" className={styles.fileInput} onChange={this.fileChange} multiple />
            </div>
          )}
        </div>

        <List className={styles.operation}>
          <List.Item
            onClick={this.toggleChecked}
            arrow="horizontal"
            extra={<Switch checked={checked} color="#624196e3" onClick={this.toggleChecked} />}
          >
            是否设为私密
          </List.Item>
          <Picker data={habitData} cols={1} value={habitValue} onOk={this.onHabitPickerOk}>
            <List.Item arrow="horizontal">选择已打卡的习惯</List.Item>
          </Picker>
        </List>
      </div>
    );
  }
}

export default CreateLog;
