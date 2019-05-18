import React, { Component } from 'react';
import styles from './Record.module.scss';
import { Icon, Empty, Avatar, message, Pagination } from 'antd';
import { connect } from 'react-redux';
import { changeMenuKey } from '@/store/action/nav';
import { getUserList } from '@/services/user';
import { getHabitList } from '@/services/habit';
import { getLogList } from '@/services/log';
import { getTodayIsClockList } from '@/services/clock';
import moment from 'moment';

@connect(
  null,
  { changeMenuKey }
)
class AdminRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cardData: [
        { count: 0, name: '总用户数量', icon: 'team', color: '#0079b1', key: ['1'], path: '/admin/user' },
        { count: 0, name: '用户日增长', icon: 'rise', color: '#55bb8c', key: ['1'], path: '/admin/user' },
        { count: '0%', name: '习惯完成率', icon: 'pie-chart', color: '#f4606c', key: ['5'], path: '/admin/habit' },
        { count: 0, name: '日志数量', icon: 'file-text', color: '#9ba9a9', key: ['3'], path: '/admin/square' },
      ],
      clockInfo: null, // 打卡列表信息
      pageNo: 1, // 第几页
      pageSize: 10, // 一页的数据数量
      totalCount: 0, // 数据总数
    };
  }

  componentDidMount() {
    this.getUserListInfo();
    this.getHabitListInfo();
    this.getLogListInfo();
    this.getTodayIsClockListInfo();
  }

  // 获取用户列表信息
  getUserListInfo = async () => {
    const { cardData } = this.state;

    const result = await getUserList();
    if (result.data.code === '0') {
      cardData[0].count = result.data.data.totalCount;
      cardData[1].count = result.data.data.dailyGrowth;
      this.setState({ cardData });
    } else {
      message.error(result.data.message);
    }
  };

  // 获取习惯列表信息
  getHabitListInfo = async () => {
    const { cardData } = this.state;

    const result = await getHabitList();
    if (result.data.code === '0') {
      cardData[2].count = result.data.data.completionRate + '%';
      this.setState({ cardData });
    } else {
      message.error(result.data.message);
    }
  };

  // 获取日志列表信息
  getLogListInfo = async () => {
    const { cardData } = this.state;

    const result = await getLogList();
    if (result.data.code === '0') {
      cardData[3].count = result.data.data.totalCount;
      this.setState({ cardData });
    } else {
      message.error(result.data.message);
    }
  };

  // 获取今日打卡记录列表
  getTodayIsClockListInfo = async () => {
    const { pageNo, pageSize } = this.state;

    const result = await getTodayIsClockList({ status: '1', pageNo, pageSize });
    if (result.data.code === '0') {
      this.setState({
        clockInfo: result.data.data.result,
        totalCount: result.data.data.totalCount,
      });
    } else {
      message.error(result.data.message);
    }
  };

  // 分页页面改变事件
  onPageChange = pageNo => {
    this.setState({ pageNo });
    this.getTodayIsClockListInfo();
  };

  // 点击记录卡片事件
  handleClickCard = (key, path) => {
    const { changeMenuKey, history } = this.props;
    changeMenuKey(key);
    history.push(path);
  };

  render() {
    const { cardData, pageNo, pageSize, totalCount, clockInfo } = this.state;
    return (
      <div className={styles.container}>
        {/* 数据统计 */}
        <div className={styles.cardContainer}>
          {cardData.map(item => (
            <div
              className={styles.card}
              style={{ backgroundColor: item.color }}
              key={item.name}
              onClick={() => this.handleClickCard(item.key, item.path)}
            >
              {/* 如果超过1000，显示999+ */}
              <span className={styles.number}>{parseInt(item.count) > 999 ? '999+' : item.count}</span>
              <span className={styles.name}>{item.name}</span>
              <Icon type={item.icon} className={styles.cardIcon} />
            </div>
          ))}
        </div>
        {/* 打卡记录 */}
        <div className={styles.listContainer}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>今日打卡情况</span>
            <span className={styles.headerTime}>{moment().format('YYYY-MM-DD')}</span>
          </div>
          {clockInfo ? (
            <ul className={styles.list}>
              {clockInfo.map(item => (
                <li className={styles.listItem} key={item.id}>
                  <div className={styles.user}>
                    {item.avatar ? (
                      <Avatar src={item.avatar} className={styles.avatar} />
                    ) : (
                      <Avatar icon="user" className={styles.avatar} />
                    )}
                    <span className={styles.username}>{item.nickname}</span>
                  </div>
                  <span className={styles.habit}>习惯：{item.name}</span>

                  <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" className={styles.successIcon} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty className={styles.empty} />
          )}

          {clockInfo && (
            <Pagination
              current={pageNo}
              total={totalCount}
              className={styles.pagination}
              pageSize={pageSize}
              onChange={this.onPageChange}
            />
          )}
        </div>
      </div>
    );
  }
}

export default AdminRecord;
