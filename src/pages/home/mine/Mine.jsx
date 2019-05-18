import React, { Component } from 'react';
import { ActionSheet, List, Toast } from 'antd-mobile';
import styles from './Mine.module.scss';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { changeUserLoginStatus } from '@/store/action/user';
import { getHabitInfo } from '@/services/habit';
import { getClockInfo } from '@/services/clock';
import moment from 'moment';

@connect(
  state => ({
    userInfo: state.user.userInfo,
  }),
  { changeUserLoginStatus }
)
class HomeMine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: 'none', // 退出登陆确认框
      processCount: 0, // 进行中次数
      completedCount: 0, // 已完成次数
      clockCount: 0, //打卡次数
    };
  }

  componentDidMount() {
    this.getHabitAndClockData();
  }

  // 获取打卡天数和进行完成天数
  getHabitAndClockData = async () => {
    const habitReq = { my_habit: 'my_habit', pageNo: 1, pageSize: 10000000 };
    const habitResult = await getHabitInfo(habitReq);
    if (habitResult.data.code === '1') return Toast.info(habitResult.data.message, 1);
    const processArray = [];
    const completedArray = [];
    for (const item of habitResult.data.data) {
      if (item.status === '1') {
        processArray.push(item);
      } else if (item.status === '2') {
        completedArray.push(item);
      }
    }

    const clockReq = { status: '1', pageNo: 1, pageSize: 10000000 };
    const clockResult = await getClockInfo(clockReq);
    if (clockResult.data.code === '1') return Toast.info(clockResult.data.message, 1);

    this.setState({
      processCount: processArray.length,
      completedCount: completedArray.length,
      clockCount: clockResult.data.data.length,
    });
  };

  // 渲染性别
  renderSex = () => {
    const { sex } = this.props.userInfo;
    if (sex === '1') {
      return <i className={classNames(styles.sexIcon, 'icon-sexm', 'iconfont')} style={{ color: '#0088cc' }} />;
    } else if (sex === '2') {
      return <i className={classNames(styles.sexIcon, 'icon-sexw', 'iconfont')} style={{ color: '#e46993' }} />;
    }
  };

  // 跳转对应路由
  goRoute = path => {
    const { history } = this.props;
    history.push(path);
  };

  // 点击退出登陆事件
  showActionSheet = () => {
    const BUTTONS = ['退出登陆', '取消'];
    const isIPhone = new RegExp('\\biPhone\\b|\\biPod\\b', 'i').test(window.navigator.userAgent);
    let wrapProps;
    if (isIPhone) {
      wrapProps = {
        onTouchStart: e => e.persist(),
      };
    }

    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS,
        cancelButtonIndex: BUTTONS.length - 1,
        destructiveButtonIndex: BUTTONS.length - 2,
        maskClosable: true,
        'data-seed': 'logId',
        wrapProps,
      },
      buttonIndex => {
        this.setState({ clicked: BUTTONS[buttonIndex] });
        return new Promise(resolve => {
          // 如果点击的是退出
          if (buttonIndex === 0) {
            window.localStorage.setItem('uid', '');
            window.localStorage.setItem('token', '');
            changeUserLoginStatus(false);
            window.location.reload();
          }
          resolve();
        });
      }
    );
  };

  // 渲染加入天数
  renderDays = () => {
    const { create_time } = this.props.userInfo;
    const duration = moment.duration(moment().diff(create_time));
    return Number.parseInt(duration.asDays()) + 1;
  };

  render() {
    const { nickname, avatar, motto, background_image } = this.props.userInfo;
    const { processCount, completedCount, clockCount } = this.state;

    return (
      <div className={styles.container}>
        {/* 用户信息 */}
        <div className={styles.imageContainer}>
          {background_image ? (
            <img src={background_image} alt="背景图片" className={styles.image} />
          ) : (
            <div className={styles.image} />
          )}
        </div>
        <div className={styles.user}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {avatar ? (
                <img src={avatar} alt="头像" className={styles.avatarImage} />
              ) : (
                <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
              )}
            </div>
          </div>
          <div className={styles.nickname}>
            {nickname}
            {this.renderSex()}
          </div>
          <div className={styles.motto}>{motto}</div>
          <div className={styles.record}>
            <div className={styles.recordItem}>
              <span className={styles.recordTitle}>加入天数</span>
              <span className={styles.recordValue}>{this.renderDays()}</span>
            </div>

            <div className={styles.recordItem}>
              <span className={styles.recordTitle}>打卡次数</span>
              <span className={styles.recordValue}>{clockCount || 0}</span>
            </div>

            <div className={styles.recordItem}>
              <span className={styles.recordTitle}>进行中</span>
              <span className={styles.recordValue}>{processCount || 0}</span>
            </div>

            <div className={styles.recordItem}>
              <span className={styles.recordTitle}>已完成</span>
              <span className={styles.recordValue}>{completedCount || 0}</span>
            </div>
          </div>
          <div />
        </div>

        {/* 操作列表 */}
        <List className={styles.operation}>
          <List.Item
            thumb={<i className={classNames(styles.operationIcon, 'iconfont', 'icon-ziliao')} />}
            arrow="horizontal"
            onClick={() => this.goRoute('/home/mine/edit')}
          >
            个人资料
          </List.Item>
          <List.Item
            thumb={<i className={classNames(styles.operationIcon, 'iconfont', 'icon-zhuanxierizhi')} />}
            onClick={() => this.goRoute('/home/mine/logs')}
            arrow="horizontal"
          >
            我的日志
          </List.Item>
          <List.Item
            thumb={<i className={classNames(styles.operationIcon, 'iconfont', 'icon-jianduchuanhuo')} />}
            onClick={() => this.goRoute('/home/mine/supervision')}
            arrow="horizontal"
          >
            我的监督
          </List.Item>
        </List>

        <List className={styles.operation}>
          <List.Item
            thumb={<i className={classNames(styles.operationIcon, 'iconfont', 'icon-iconset0103')} />}
            onClick={() => this.goRoute('/home/mine/about')}
            arrow="horizontal"
          >
            关于我们
          </List.Item>
        </List>

        <List className={styles.operation}>
          <List.Item
            thumb={<i className={classNames(styles.operationIcon, 'iconfont', 'icon-tuichu2')} />}
            onClick={this.showActionSheet}
            arrow="horizontal"
          >
            退出登陆
          </List.Item>
        </List>
      </div>
    );
  }
}

export default HomeMine;
