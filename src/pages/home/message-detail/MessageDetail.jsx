import React, { Component } from 'react';
import { NavBar, Icon, TextareaItem, Picker, Toast, Modal } from 'antd-mobile';
import styles from './MessageDetail.module.scss';
import '@/assets/styles/navbar.scss';
import './MessageDetail.scss';
import classNames from 'classnames';
import validateForm from '@/utils/form-validation';
import {
  getMessageDetailInfo,
  createMessageDetail,
  deleteMessage,
  modifyMessageInfo,
  changeMessageRead,
} from '@/services/message';
import ForMatDateUtil from '@/utils/format-days';

class MessageDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textareaValue: '', // 输入框输入值
      messageInfo: null, // 消息列表
      nickname: '', // 顶部的昵称
      isSystemMessage: false, //是否是系统消息
    };
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    this.getMessageDetail();
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }

  // 获取二级消息详情
  getMessageDetail = async () => {
    const { match } = this.props;
    const message_id = match.params.id;
    const req = { message_id, page: 1, pageSize: 1000000 };
    const messageResult = await getMessageDetailInfo(req);
    if (messageResult.data.code === '1') return Toast.info(messageResult.data.message, 1);

    const messageData = messageResult.data.data;
    let messageInfo = [];
    let nickname = '';
    let sendToUserId = '';

    if (messageData.length) {
      const uid = window.localStorage.getItem('uid');

      for (const message of messageData) {
        message.isMySend = message.user2_id === Number(uid) ? '1' : '0';
        messageInfo.push(message);
      }
      nickname = messageData[0].user2_id === Number(uid) ? messageData[0].nickname1 : messageData[0].nickname2;
      sendToUserId = messageData[0].user2_id === Number(uid) ? messageData[0].user1_id : messageData[0].user2_id;
    }

    const isSystemMessage = messageInfo[0].user2_id === 1;

    this.setState({
      messageInfo,
      nickname: isSystemMessage ? '系统消息' : nickname,
      sendToUserId,
      isSystemMessage,
    });
  };

  // 容器滚动到底部
  scrollToBottom = () => {
    this.containerRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
  };

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.push('/home/message');
  };

  // 删除消息
  deleteMessage = () => {
    const { match, history } = this.props;

    // 需要用promise才不会报错
    Modal.alert('Delete', '确定要删除该消息？', [
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
        onPress: () =>
          new Promise(resolve => {
            setTimeout(async () => {
              resolve();
              const result = await deleteMessage({ id: Number(match.params.id) });
              if (result.data.code === '0') {
                Toast.info('删除消息成功', 1);
                history.push('/home/message');
              } else {
                Toast.info(result.data.message, 1);
              }
            }, 0);
          }),
      },
    ]);
  };

  // picker点击确定事件
  handleOnPickerOk = value => {
    this.sendMessage(value.toString());
  };

  // 输入框输入
  handleValueChange = value => {
    this.setState({
      textareaValue: value,
    });
  };

  // 输入框点击发送事件
  clickSendMessage = () => {
    const { textareaValue } = this.state;
    this.sendMessage(textareaValue);

    this.setState({
      textareaValue: '',
    });
  };

  // 改变已读未读状态
  changeReadStatus = async (id, read) => {
    const req = { id, read };
    const result = await changeMessageRead(req);
    if (result.data.code === '1') return Toast.info(result.data.message, 1);
  };

  // 发送消息
  sendMessage = async value => {
    const { sendToUserId } = this.state;
    const { match } = this.props;
    const message_id = match.params.id;

    const validateMessage = validateForm([{ value, name: '消息内容', required: true, maxLength: 100 }]);
    if (validateMessage) return Toast.info(validateMessage, 1);

    const req = { content: value, message_id, user1_id: sendToUserId };
    const result = await createMessageDetail(req);
    if (result.data.code === '1') return Toast.info(result.data.message, 1);

    // 改变主消息的状态和内容

    this.changeReadStatus(message_id, '0');
    const messageReq = { id: message_id, content: value, status: '0' };
    const messageResult = await modifyMessageInfo(messageReq);
    if (messageResult.data.code === '1') return Toast.info(messageResult.data.message, 1);

    this.getMessageDetail();
  };

  // 渲染发送者的头像
  renderLeftAvatar = item => {
    // 系统消息
    if (item.user2_id === 1) {
      return <i className={classNames(styles.userIcon, 'icon-laoban', 'iconfont')} />;
    } else {
      // 用户消息
      return item.avatar2 ? (
        <img src={item.avatar2} alt="头像" className={styles.image} />
      ) : (
        <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
      );
    }
  };

  render() {
    const { textareaValue, messageInfo, nickname, isSystemMessage } = this.state;
    const pickerData = [
      {
        value: '不能改变自己，和咸鱼有什么区别?',
        label: '不能改变自己，和咸鱼有什么区别?',
        children: [],
      },
      {
        value: '坚持每天取得一点点进步',
        label: '坚持每天取得一点点进步',
        children: [],
      },
      {
        value: '成功就是坚持不懈的努力',
        label: '成功就是坚持不懈的努力',
        children: [],
      },
    ];

    return (
      <div className={styles.container} ref={this.containerRef}>
        {/* 顶部栏 */}
        <NavBar
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          rightContent={<div onClick={this.deleteMessage}>删除</div>}
          mode="dark"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          {nickname}
        </NavBar>

        {/* 消息内容 */}
        {messageInfo && messageInfo.length > 0 && (
          <div className={styles.messageList}>
            {messageInfo.map(item => (
              <div className={styles.messageItem} key={item.id}>
                <div className={styles.time}>{ForMatDateUtil.timesToNow(item.create_time)}</div>
                {item.isMySend === '0' ? (
                  <div className={styles.leftMessage}>
                    <div className={styles.avatar}>{this.renderLeftAvatar(item)}</div>
                    <div className={styles.leftContent}>{item.content}</div>
                  </div>
                ) : (
                  <div className={styles.rightMessage}>
                    <div className={styles.rightContent}>{item.content}</div>
                    <div className={styles.avatar}>
                      {item.avatar2 ? (
                        <img src={item.avatar2} alt="头像" className={styles.image} />
                      ) : (
                        <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 底部操作栏 */}
        {!isSystemMessage && (
          <div className={classNames(styles.bottomBar, 'message-detail-bottom-bar')}>
            <div className={styles.shortcut}>
              <Picker data={pickerData} cols={1} onOk={this.handleOnPickerOk}>
                <div className={styles.shortcutText}>快捷</div>
              </Picker>

              <Icon type="up" className={styles.shortcutIcon} />
            </div>
            <TextareaItem
              className={styles.textarea}
              autoHeight
              count={100}
              value={textareaValue}
              onChange={this.handleValueChange}
            />
            <div className={styles.button} onClick={this.clickSendMessage}>
              发送
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default MessageDetail;
