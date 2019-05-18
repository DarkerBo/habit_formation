import React, { Component } from 'react';
import { NavBar, Icon, List, Toast, Modal } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './HabitDetail.module.scss';
import classNames from 'classnames';
import validateForm from '@/utils/form-validation';
import { getHabitDetail, deleteHabit } from '@/services/habit';
import { getMessageInfo, createOrEditMessage, createMessageDetail, modifyMessageInfo } from '@/services/message';
import moment from 'moment';

class HabitDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      habitInfoData: null, // 习惯信息
      userId: window.localStorage.getItem('uid'), // 当前用户的ID
      todayIsNeedClock: false, // 今天是否要打卡
      todayIsClock: false, // 今天是否已打卡
      message: '', //提醒留言
    };
  }

  componentDidMount() {
    this.getHabitInfoRecord();
  }

  // 获取该用户习惯信息
  getHabitInfoRecord = async () => {
    const { match } = this.props;
    const req = { id: Number(match.params.id) };
    const result = await getHabitDetail(req);
    if (result.data.code === '0') {
      const habitInfoData = result.data.data;

      // 判断今天是否要打卡，习惯是在进行中，而且频率是在今天
      const weekDay = new Date().getDay().toString() === '0' ? '7' : new Date().getDay().toString();
      const todayIsNeedClock =
        habitInfoData[0].status === '1' &&
        (habitInfoData[0].type !== '3' ||
          (habitInfoData[0].type === '3' && habitInfoData[0].frequency.includes(weekDay)));

      // 判断今天是否已打卡
      const todayIsClock = habitInfoData[0].cstatus === '1';

      this.setState({
        habitInfoData: habitInfoData[0],
        todayIsNeedClock,
        todayIsClock,
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  // 渲染习惯状态
  renderStatus = status => {
    if (status === '0') {
      return <span>未完成</span>;
    } else if (status === '1') {
      return <span>进行中</span>;
    } else {
      return <span>已完成</span>;
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

  // 删除习惯
  deleteHabitRecord = () => {
    const { match, history } = this.props;
    // 需要用promise才不会报错
    Modal.alert('Delete', '确定要删除该习惯？', [
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
              const result = await deleteHabit({ id: Number(match.params.id) });
              if (result.data.code === '0') {
                Toast.info('删除习惯成功', 1);
                history.push('/home/record');
              } else {
                Toast.info(result.data.message, 1);
              }
            }, 0);
          }),
      },
    ]);
  };

  // 点击提醒按钮
  clickRemind = (id, user_id, status) => {
    const { todayIsClock, todayIsNeedClock, message } = this.state;
    if (!todayIsNeedClock || (todayIsNeedClock && todayIsClock) || status !== '1') return;

    setTimeout(() => {
      Modal.prompt(
        '请输入你想提醒的话',
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
                setTimeout(async () => {
                  const validateMessage = [{ name: '内容', require: true, value, maxLength: 100 }];
                  const messageResult = validateForm(validateMessage);
                  if (messageResult) {
                    reject();
                    return Toast.info(messageResult, 1);
                  }
                  resolve();

                  // 获取有没有该习惯的主消息，没有则生成一个
                  const req = { habit_id: id, pageNo: 1, pageSize: 1 };
                  const result = await getMessageInfo(req);
                  let message_id;
                  if (result.data.code === '1') {
                    reject();
                    return Toast.info(result.data.message, 1);
                  }
                  if (!result.data.data[0]) {
                    const createMessageReq = { content: value, status: '0', habit_id: id, user1_id: user_id };
                    const createMessageResult = await createOrEditMessage(createMessageReq);
                    if (createMessageResult.data.code === '1') {
                      reject();
                      return Toast.info(createMessageResult.data.message, 1);
                    }

                    // 获取刚创建的主消息的ID
                    const messageResult = await getMessageInfo(req);
                    if (messageResult.data.code === '1') {
                      reject();
                      return Toast.info(messageResult.data.message, 1);
                    }
                    message_id = messageResult.data.data[0].id;
                  } else {
                    // 改变主消息的内容
                    message_id = result.data.data[0].id;
                    const messageReq = { id: message_id, content: value, status: '0' };
                    const messageResult = await modifyMessageInfo(messageReq);
                    if (messageResult.data.code === '1') return Toast.info(messageResult.data.message, 1);
                  }

                  // 生成二级消息
                  const messageDetailReq = { content: value, message_id, user1_id: user_id };
                  const messageDetailResult = await createMessageDetail(messageDetailReq);
                  if (messageDetailResult.data.code === '1') {
                    reject();
                    return Toast.info(messageDetailResult.data.message, 1);
                  }
                  Toast.info('发送提醒消息成功', 1);
                }, 0);
              }),
          },
        ],
        'default',
        message
      );
    });
  };

  render() {
    const { habitInfoData, userId, todayIsNeedClock, todayIsClock } = this.state;
    const uid = Number(window.localStorage.getItem('uid'));

    const dayTimeObj = {
      '0': { icon: 'icon-icon-', color: styles.allDayColor },
      '1': { icon: 'icon-zaoshang', color: styles.morningColor },
      '2': { icon: 'icon-zhongwu', color: styles.afternoonColor },
      '3': { icon: 'icon-wanshang', color: styles.eveningColor },
    };

    return (
      <div className={styles.container}>
        {/* 顶部栏 */}
        <NavBar
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          mode="dark"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          习惯详情
        </NavBar>
        {habitInfoData && (
          <>
            <div className={styles.habitItem} key={habitInfoData.id}>
              <div className={styles.habitContainer}>
                <div className={classNames(styles.habit, dayTimeObj[habitInfoData.time_of_days].color)}>
                  <i
                    className={classNames(styles.dayTimeIcon, dayTimeObj[habitInfoData.time_of_days].icon, 'iconfont')}
                  />
                  <div className={styles.habitDetail}>
                    <span className={styles.name}>{habitInfoData.name}</span>
                  </div>
                  {habitInfoData.sign === '1' && <i className={classNames(styles.star, 'icon-star', 'iconfont')} />}
                </div>
                <div className={styles.motto}>
                  <div className={styles.mottoTitle}>座右铭：</div>
                  <span className={styles.mottoContent}>{habitInfoData.encourage}</span>
                </div>
              </div>
              {/* 基本信息列表 */}
              <List renderHeader={() => '基本信息'} className={styles.messageList}>
                <List.Item>
                  状态 <List.Item.Brief>{this.renderStatus(habitInfoData.status)}</List.Item.Brief>
                </List.Item>
                <List.Item>
                  建立日期 <List.Item.Brief>{moment(habitInfoData.create_time).format('YYYY-MM-DD')}</List.Item.Brief>
                </List.Item>
                <List.Item>
                  习惯频率
                  <List.Item.Brief>{this.renderFrequency(habitInfoData.type, habitInfoData.frequency)}</List.Item.Brief>
                </List.Item>
                <List.Item>
                  约定次数 <List.Item.Brief>{habitInfoData.completion_times}次</List.Item.Brief>
                </List.Item>
                <List.Item>
                  约定结束时间
                  <List.Item.Brief>
                    {moment(habitInfoData.end_time).format('YYYY') === 'Invalid date'
                      ? '永久'
                      : moment(habitInfoData.end_time).format('YYYY-MM-DD')}
                  </List.Item.Brief>
                </List.Item>
                <List.Item>
                  今天是否要打卡 <List.Item.Brief>{todayIsNeedClock ? '需要打卡' : '不需要打卡'}</List.Item.Brief>
                </List.Item>
                <List.Item>
                  今天是否已打卡 <List.Item.Brief>{todayIsClock ? '已打卡' : '未打卡'}</List.Item.Brief>
                </List.Item>
              </List>
              {/* 监督人列表 */}
              <List renderHeader={() => '这是你的监督人'} className={styles.operation}>
                <List.Item>
                  {habitInfoData.superintendent_id === uid ? '被监督人' : '监督人'}
                  <List.Item.Brief>
                    {!habitInfoData.superintendent_id
                      ? '无'
                      : habitInfoData.superintendent_id === uid
                      ? habitInfoData.nickname2
                      : habitInfoData.nickname}
                  </List.Item.Brief>
                </List.Item>
              </List>
              {/* 坚持天数列表 */}
              <List renderHeader={() => '坚持天数'} className={styles.operation}>
                <List.Item>
                  总坚持次数 <List.Item.Brief>{habitInfoData.clock_count}</List.Item.Brief>
                </List.Item>
              </List>
              {/* 底部提醒按钮 */}
              <div className={styles.buttonContainer}>
                {habitInfoData.superintendent_id === Number(userId) ? (
                  <div
                    className={
                      !todayIsClock && todayIsNeedClock && habitInfoData.status === '1'
                        ? styles.remindButton
                        : styles.disableRemind
                    }
                    onClick={() => this.clickRemind(habitInfoData.id, habitInfoData.user_id, habitInfoData.status)}
                  >
                    提醒
                  </div>
                ) : (
                  <div className={styles.deleteButton} onClick={this.deleteHabitRecord}>
                    删除
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
}

export default HabitDetail;
