import React, { Component } from 'react';
import { NavBar, Icon, List, Toast } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './Invitation.module.scss';
import classNames from 'classnames';
import { getMessageDetail, createOrEditMessage, createMessageDetail } from '@/services/message';
import { addSuperintendent } from '@/services/habit';
import moment from 'moment';
import ForMatDateUtil from '@/utils/format-days';

class Invitation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      InvitaionInfo: null, // 监督申请信息
    };
  }

  componentDidMount() {
    this.getInvitaionInfo();
  }

  // 获取监督申请信息
  getInvitaionInfo = async () => {
    const { match } = this.props;
    const messageId = match.params.id;
    const req = { id: messageId };
    const result = await getMessageDetail(req);
    if (result.data.code === '0') {
      const InvitaionInfo = result.data.data[0];
      this.setState({
        InvitaionInfo,
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.push('/home/message');
  };

  // 点击拒绝按钮
  clickRefuse = async InvitaionInfo => {
    const { id, habit_id } = InvitaionInfo;
    const { history } = this.props;

    // 将消息内容改成你已拒绝，再发一条拒绝消息给对方
    const editReq = {
      id,
      content: '该监督申请已被拒绝',
      status: '3',
      habit_id,
    };
    const editResult = await createOrEditMessage(editReq);
    if (editResult.data.code === '1') return Toast.info(editResult.data.message, 1);

    history.push('/home/message');
  };

  // 点击接受按钮
  clickAccept = async InvitaionInfo => {
    const { id, habit_id, user1_id, user2_id, name } = InvitaionInfo;
    const { history } = this.props;

    // 将消息内容改成你已同意
    const editReq = {
      id,
      content: '该监督申请已通过',
      status: '2',
      habit_id,
    };
    const editResult = await createOrEditMessage(editReq);
    if (editResult.data.code === '1') return Toast.info(editResult.data.message, 1);

    // 增加习惯的监督人ID
    const superintendentReq = { id: habit_id, superintendent_id: user1_id };
    const superintendentResult = await addSuperintendent(superintendentReq);
    if (superintendentResult.data.code === '1') return Toast.info(superintendentResult.data.message, 1);

    // 发一条二级消息
    const messageDetailReq = { content: `我已成为你的'${name}'习惯的监督人`, message_id: id, user1_id: user2_id };
    const messageDetailResult = await createMessageDetail(messageDetailReq);
    if (messageDetailResult.data.code === '1') return Toast.info(messageDetailResult.data.message, 1);

    history.push('/home/message');
  };

  // 渲染申请人性别
  renderSex = sex => {
    if (sex === '1') {
      return <i className={classNames(styles.sexIcon, 'icon-sexm', 'iconfont')} style={{ color: '#0088cc' }} />;
    } else if (sex === '2') {
      return <i className={classNames(styles.sexIcon, 'icon-sexw', 'iconfont')} style={{ color: '#e46993' }} />;
    }
  };

  // 渲染申请时间
  renderTime = date => {
    const result = ForMatDateUtil.timesToNow(date);
    return result;
  };

  // 渲染习惯时分
  renderTimeOfDays = time => {
    switch (time) {
      case '0':
        return '全天习惯';
      case '1':
        return '晨间习惯';
      case '2':
        return '午间习惯';
      case '3':
        return '夜间习惯';
      default:
        return;
    }
  };

  // 渲染习惯频率
  renderFrequency = (type, frequency) => {
    switch (type) {
      case '0':
        return '每天';
      case '1':
        return `每周${frequency}天`;
      case '2':
        return `每月${frequency}天`;
      case '3':
        const arr = frequency.split(',');
        const weekArr = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
        let str = '每';
        arr.forEach(item => {
          str += `${weekArr[Number(item) - 1]} `;
        });
        return str;
      default:
        break;
    }
  };

  render() {
    const { InvitaionInfo } = this.state;

    return (
      <div className={styles.container}>
        {/* 顶部栏 */}
        <NavBar
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          mode="dark"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          监督邀请
        </NavBar>
        {InvitaionInfo && (
          <>
            <div className={styles.invitationContainer}>
              {/* 头部 */}
              <div className={styles.invitationHeader}>
                <div className={styles.author}>
                  <div className={styles.avatar}>
                    {InvitaionInfo.avatar ? (
                      <img src={InvitaionInfo.avatar} alt="avatar" className={styles.avatarImage} />
                    ) : (
                      <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
                    )}
                  </div>
                  <div className={styles.user}>
                    <div className={styles.nicknameContainer}>
                      <span className={styles.nickname}>{InvitaionInfo.nickname}</span>
                      {/* 性别图标 */}
                      {this.renderSex(InvitaionInfo.sex)}
                    </div>
                    <span className={styles.time}>{this.renderTime(InvitaionInfo.create_time)}</span>
                  </div>
                </div>
              </div>

              {/* 邀请内容 */}
              <div className={styles.invitationContent}>{InvitaionInfo.content}</div>
            </div>

            {/* 基本信息列表 */}
            <List renderHeader={() => '习惯信息'} className={styles.messageList}>
              <List.Item>
                习惯名称 <List.Item.Brief>{InvitaionInfo.name}</List.Item.Brief>
              </List.Item>
              <List.Item>
                习惯时分 <List.Item.Brief>{this.renderTimeOfDays(InvitaionInfo.time_of_days)}</List.Item.Brief>
              </List.Item>
              <List.Item>
                建立日期 <List.Item.Brief>{moment(InvitaionInfo.create_time).format('YYYY-MM-DD')}</List.Item.Brief>
              </List.Item>
              <List.Item>
                习惯频率
                <List.Item.Brief>{this.renderFrequency(InvitaionInfo.type, InvitaionInfo.frequency)}</List.Item.Brief>
              </List.Item>
              <List.Item>
                约定次数 <List.Item.Brief>{InvitaionInfo.completion_times}次</List.Item.Brief>
              </List.Item>
              <List.Item>
                约定结束时间
                <List.Item.Brief>
                  {moment(InvitaionInfo.end_time).format('YYYY') === 'Invalid date'
                    ? '永久'
                    : moment(InvitaionInfo.end_time).format('YYYY-MM-DD')}
                </List.Item.Brief>
              </List.Item>
            </List>

            {/* 底部按钮 */}
            {InvitaionInfo.status === '3' ? (
              <div className={styles.buttonContainer}>
                <div className={styles.isRefuse}>该申请已被拒绝</div>
              </div>
            ) : (
              <div className={styles.buttonContainer}>
                <div
                  className={classNames(styles.button, styles.refuse)}
                  onClick={() => this.clickRefuse(InvitaionInfo)}
                >
                  <i className={classNames(styles.buttonIcon, 'icon-ban', 'iconfont')} />
                  拒绝
                </div>

                <div
                  className={classNames(styles.button, styles.accept)}
                  onClick={() => this.clickAccept(InvitaionInfo)}
                >
                  <i className={classNames(styles.buttonIcon, 'icon-pass', 'iconfont')} />
                  接受
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default Invitation;
