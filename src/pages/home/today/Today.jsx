import React, { Component } from 'react';
import { NavBar, Toast } from 'antd-mobile';
import styles from './Today.module.scss';
import '@/assets/styles/navbar.scss';
import classNames from 'classnames';
import { getPeriod } from '@/utils/get-period';
import { getHabitInfo, changeUserHabitStatus } from '@/services/habit';
import { createOrEditClock } from '@/services/clock';
import { getBannerInfo } from '@/services/banner';
import throttle from '@/utils/throttle';

class HomeToday extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bannerInfo: null,
      habitInfoData: [], // 习惯信息
      isLoadFinish: false, // 数据是否已经加载完成
      isLoading: false, // 是否正在获取数据
      pageNo: 1,
      pageSize: 5,
    };
  }

  componentDidMount() {
    // 获取习惯信息
    this.getHabitInfoRecord();
    this.getBannerInfoRecord();
  }

  // 获取该用户状态为正在进行中习惯信息
  getHabitInfoRecord = async () => {
    const { pageNo, pageSize, habitInfoData } = this.state;
    const habitReq = { my_habit: 'my_habit', status: '1', pageNo, pageSize };

    this.setState({ isLoading: true });
    const result = await getHabitInfo(habitReq);
    this.setState({ isLoading: false });
    if (result.data.code === '0') {
      const habitInfo = result.data.data;
      const period = getPeriod().value;

      if (habitInfo.length < pageSize) this.setState({ isLoadFinish: true });

      // 判断今天是否可以打卡
      let weekDayArray = [];
      const weekDay = new Date().getDay().toString() === '0' ? '7' : new Date().getDay().toString();

      for (const item of [...habitInfoData, ...habitInfo]) {
        if (item.type !== '3' || (item.type === '3' && item.frequency.includes(weekDay))) {
          weekDayArray.push(item);
        }
      }

      // 如果是当前时分或者是全天的习惯按顺序显示打卡，其他时分为不能打卡且排在后面
      let sortArray = [];
      let k = 0;
      for (const [i, item] of weekDayArray.entries()) {
        const flag = item.time_of_days === period || item.time_of_days === '0';

        if (flag) {
          sortArray.splice(k, 0, item);
          k = i + 1;
        } else {
          sortArray.push(item);
        }
      }

      this.setState({
        habitInfoData: sortArray,
        pageNo: pageNo + 1,
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 获取公告图信息
  getBannerInfoRecord = async () => {
    const result = await getBannerInfo();
    if (result.data.code === '0') {
      this.setState({
        bannerInfo: result.data.data[0],
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 创建新习惯
  clickCreateHabit = () => {
    const { history } = this.props;
    history.push('/home/habit/create');
  };

  // 手动更新打卡记录
  clockOn = async (cid, habit_id, cstatus, flag) => {
    // 非该时分的话不能打卡
    if (!flag) return;
    const { habitInfoData } = this.state;

    const req = { id: cid, habit_id, status: cstatus === '1' ? '0' : '1' };
    const result = await createOrEditClock(req);
    if (result.data.code === '0') {
      Toast.info(cstatus === '0' ? '打卡成功' : '已取消打卡', 1);
      const statusResult = await changeUserHabitStatus({ habit_id });
      if (statusResult.data.code === '1') return Toast.info(statusResult.data.message, 1);
      const changeStatusIndex = habitInfoData.findIndex(item => item.id === habit_id);
      habitInfoData[changeStatusIndex].cstatus = cstatus === '1' ? '0' : '1';

      this.setState({
        habitInfoData: habitInfoData,
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 渲染对应时分的习惯
  renderHabit = item => {
    const dayTimeObj = {
      '0': { icon: 'icon-icon-', color: styles.allDayColor },
      '1': { icon: 'icon-zaoshang', color: styles.morningColor },
      '2': { icon: 'icon-zhongwu', color: styles.afternoonColor },
      '3': { icon: 'icon-wanshang', color: styles.eveningColor },
    };

    // 获取当前时分，判断是否可以打卡
    const period = getPeriod().value;
    const itemClass = item.time_of_days === period || item.time_of_days === '0';

    return (
      <div
        className={classNames(itemClass ? styles.habitItem : styles.disableItem, dayTimeObj[item.time_of_days].color)}
        key={item.id}
        onClick={() => this.clockOn(item.cid, item.id, item.cstatus, itemClass)}
      >
        <i className={classNames(styles.dayTimeIcon, dayTimeObj[item.time_of_days].icon, 'iconfont')} />
        <div className={styles.habit}>
          <span className={styles.habitName}>{item.name}</span>
          <span className={styles.motto}>{item.encourage}</span>
        </div>
        {item.cstatus === '1' && <i className={classNames(styles.success, 'icon-dagouyouquan', 'iconfont')} />}
      </div>
    );
  };

  // 无限加载数据
  handleScroll = e => {
    let { isLoadFinish, isLoading } = this.state;
    const { scrollHeight, scrollTop, clientHeight } = e.target;

    if (scrollTop + clientHeight + 30 >= scrollHeight && !isLoadFinish && !isLoading) {
      throttle(this.getHabitInfoRecord(), 250);
    }
  };

  render() {
    const { habitInfoData, bannerInfo } = this.state;

    return (
      <div className={styles.container} onScroll={this.handleScroll}>
        <NavBar
          mode="dark"
          rightContent={[
            <div onClick={this.clickCreateHabit} key="0">
              <i className={classNames(styles.plus, 'icon-jia', 'iconfont')} />
            </div>,
          ]}
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          今天
        </NavBar>
        {bannerInfo && (
          <div className={styles.bannerContainer}>
            <img src={bannerInfo.picture} alt="照片" className={styles.image} />
            <div className={styles.content}>{bannerInfo.content}</div>
            <p className={styles.source}>—— {bannerInfo.author}</p>
          </div>
        )}

        <div className={styles.habitList}>
          {!habitInfoData || habitInfoData.length < 1 ? (
            <div className={styles.empty}>
              <i className={classNames(styles.emptyIcon, 'icon-empty', 'iconfont')} />
              <span>今天没有要打卡的习惯~</span>
            </div>
          ) : (
            <>{habitInfoData.map(item => this.renderHabit(item))}</>
          )}
        </div>
      </div>
    );
  }
}

export default HomeToday;
