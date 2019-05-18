import React, { Component } from 'react';
import { NavBar, SegmentedControl, Modal, Toast } from 'antd-mobile';
import styles from './Message.module.scss';
import '@/assets/styles/navbar.scss';
import './Message.scss';
import classNames from 'classnames';
import Hammer from 'hammerjs';
import { getUserInfo } from '@/services/user';
import {
  getMessageInfo,
  changeMessageRead,
  getMessageDetailList,
  deleteMessage,
  getSystemMessageInfo,
} from '@/services/message';
import ForMatDateUtil from '@/utils/format-days';

class HomeMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false, // 是否显示操作模态框
      messageInfo: null, // 消息
      uid: window.localStorage.getItem('uid'), // 当前用户的ID
      deleteMsgId: '', // 删除的消息的ID
      selectedIndex: 0, // 选中tabs的索引
    };
    this.messageRef = React.createRef();
  }

  componentDidMount() {
    const req = { page: 1, pageSize: 10000000 };
    this.getMessageInfoRecod(req);
    this.bindMessagePressEvent();
  }

  componentDidUpdate() {
    this.bindMessagePressEvent();
  }

  // 获取消息列表
  getMessageInfoRecod = async req => {
    const result = await getMessageInfo(req);
    if (result.data.code === '0') {
      const messageData = result.data.data;
      const messageInfo = [];
      const userData = await getUserInfo();
      if (userData.data.code === '1') return Toast.info(userData.data.message, 1);
      const userInfo = userData.data.data;

      // 将监督人的信息放到messageInfo，将自己的信息过滤掉
      for (const message of messageData) {
        const {
          id,
          avatar1,
          avatar2,
          content,
          create_time,
          nickname1,
          nickname2,
          user1_id,
          user2_id,
          read,
          status,
          habit_id,
        } = message;
        const nickname = userInfo.nickname === nickname1 ? nickname2 : nickname1;
        const avatar = userInfo.avatar === avatar1 ? avatar2 : avatar1;
        const user_id = userInfo.id === user1_id ? user2_id : user1_id;
        let lastSendUserId = user2_id;

        if (status === '0') {
          // 获取最新那条二级消息的发送人ID
          const req = { content, pageNo: 1, pageSize: 1 };
          const result = await getMessageDetailList(req);
          if (result.data.code === '1') return Toast.info(result.data.message, 1);
          lastSendUserId = result.data.data[0].user2_id;
        }

        const messItem = {
          id,
          content,
          create_time,
          read,
          status,
          nickname,
          avatar,
          user_id,
          habit_id,
          lastSendUserId,
        };

        // 如果不是自己发的监督申请才push进去渲染
        const flag = status === '1' && user2_id === userInfo.id;
        if (!flag) messageInfo.push(messItem);
      }

      this.setState({
        messageInfo,
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  bindMessagePressEvent = () => {
    // 有消息时，才绑定长按事件
    if (this.messageRef.current) {
      const $messageDivs = this.messageRef.current.children;

      for (const $messageDiv of $messageDivs) {
        const id = $messageDiv.getAttribute('data-key');
        const status = $messageDiv.getAttribute('data-status');
        const read = $messageDiv.getAttribute('data-read');
        const lastSendUserId = $messageDiv.getAttribute('data-last-send-id');

        const hammer = new Hammer($messageDiv);
        hammer.on('press', this.toggleModal.bind(this, id));
        hammer.on('tap', this.clickMessage.bind(this, id, status, read, lastSendUserId));
      }
    }
  };

  // 渲染发送者的头像
  renderAvatar = item => {
    // 系统消息
    if (item.user2_id === 1) {
      return <i className={classNames(styles.adminIcon, 'icon-laoban', 'iconfont')} />;
    } else {
      // 用户消息
      return item.avatar ? (
        <img src={item.avatar} alt="头像" className={styles.avatarImage} />
      ) : (
        <i className={classNames(styles.adminIcon, 'icon-touxiang', 'iconfont')} />
      );
    }
  };

  // 渲染消息内容
  renderContent = item => {
    let stylesName = '';
    switch (item.status) {
      case '0':
        stylesName = 'text';
        break;
      case '1':
        stylesName = 'process';
        break;
      case '2':
        stylesName = 'accept';
        break;
      case '3':
        stylesName = 'refuse';
        break;
      default:
        break;
    }

    return <span className={styles[stylesName]}>{item.content}</span>;
  };

  onTabsChange = async e => {
    const req = { page: 1, pageSize: 10000000 };

    if (e.nativeEvent.selectedSegmentIndex === 1) {
      const result = await getSystemMessageInfo(req);
      if (result.data.code === '1') return Toast.info(result.data.message, 1);
      const messageInfo = result.data.data;
      if (messageInfo.length) {
        for (const message of messageInfo) {
          message.user_id = 0;
          message.lastSendUserId = 0;
          message.nickname = '系统消息';
          message.avatar = '';
        }
      }
      this.setState({
        messageInfo,
      });
    } else {
      this.getMessageInfoRecod(req);
    }

    this.setState({
      selectedIndex: e.nativeEvent.selectedSegmentIndex,
    });
  };

  // 改变已读未读状态
  changeReadStatus = async (id, read) => {
    const req = { id, read };
    const result = await changeMessageRead(req);
    if (result.data.code === '1') return Toast.info(result.data.message, 1);
  };

  // 单击消息事件
  clickMessage = (id, status, read, lastSendUserId) => {
    const { history } = this.props;
    const { uid } = this.state;

    if (read === '0' && lastSendUserId !== uid) {
      // 若消息状态未读，改成已读
      this.changeReadStatus(id, '1');
    }

    switch (status) {
      case '0':
      case '2':
        return history.push(`/home/message/${id}`);
      case '1':
      case '3':
        return history.push(`/home/habit/message/invitation/${id}`);
      default:
        return;
    }
  };

  toggleModal = (id, e) => {
    // 修复 Android 上点击穿透
    e && e.preventDefault();
    this.setState({
      showModal: !this.state.showModal,
      deleteMsgId: id,
    });
  };

  // 删除消息
  deleteMessage = async () => {
    const { deleteMsgId } = this.state;
    if (!deleteMsgId) return;

    const result = await deleteMessage({ id: deleteMsgId });
    if (result.data.code === '0') {
      Toast.info('删除消息成功', 1);
      this.getMessageInfoRecod();
      this.toggleModal();
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  render() {
    const { showModal, messageInfo, uid, selectedIndex } = this.state;
    return (
      <div className={styles.container}>
        {/* 顶部栏 */}
        <NavBar mode="dark" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
          消息
        </NavBar>
        <div className={styles.tabsContainer}>
          <SegmentedControl values={['留言', '通知']} onChange={this.onTabsChange} selectedIndex={selectedIndex} />
        </div>
        {!messageInfo || messageInfo.length < 1 ? (
          <div className={styles.empty}>
            <i className={classNames(styles.emptyIcon, 'icon-empty', 'iconfont')} />
            <span>没有消息哦~</span>
          </div>
        ) : (
          // 消息列表
          <div className={styles.messageList} ref={this.messageRef}>
            {messageInfo.map(item => (
              <div
                className={styles.messageItem}
                key={item.id}
                data-key={item.id}
                data-status={item.status}
                data-read={item.read}
                data-last-send-id={item.lastSendUserId}
              >
                <div className={styles.pointContainer}>
                  {item.read === '0' && item.lastSendUserId !== Number(uid) && <div className={styles.point} />}
                  <div className={styles.avatar}>{this.renderAvatar(item)}</div>
                </div>

                <div className={styles.contentContainer}>
                  <div className={styles.nameContainer}>
                    <div className={styles.nickname}>{item.nickname}</div>
                    <span className={styles.date}>{ForMatDateUtil.timesToNow(item.create_time)}</span>
                  </div>

                  <div className={styles.content}>{this.renderContent(item)}</div>
                </div>
                {/* 模态框 */}
                <Modal visible={showModal} transparent onClose={this.toggleModal} wrapClassName="modal">
                  <div className={styles.modal}>
                    <div className="message-delete" onClick={this.deleteMessage}>
                      删除消息
                    </div>
                  </div>
                </Modal>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default HomeMessage;
