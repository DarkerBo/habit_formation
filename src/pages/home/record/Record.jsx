import React, { Component } from 'react';
import { NavBar, Tabs, Toast } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './Record.module.scss';
import './Record.scss';
import classNames from 'classnames';
import HabitList from '@/components/habit-list/HabitList';
import { getHabitInfo } from '@/services/habit';
import throttle from '@/utils/throttle';

class HomeRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      habitInfoData: [], // 习惯信息
      isLoadFinish: false, // 数据是否已经加载完成
      isLoading: false, // 是否正在获取数据
      pageNo: 1,
      pageSize: 5,
    };

    this.containRef = React.createRef();
  }

  componentDidMount() {
    const { pageNo, pageSize } = this.state;

    const req = { my_habit: 'my_habit', pageNo, pageSize };
    this.getHabitInfoRecord(req);

    this.containRef.current.addEventListener('scroll', this.handleScroll, { passive: true });
  }

  // 获取该用户习惯信息
  getHabitInfoRecord = async req => {
    const { habitInfoData, pageNo, pageSize } = this.state;

    this.setState({ isLoading: true });
    const result = await getHabitInfo(req);
    this.setState({ isLoading: false });

    if (result.data.code === '0') {
      const habitInfo = result.data.data;
      if (habitInfo.length < pageSize) this.setState({ isLoadFinish: true });

      this.setState({
        habitInfoData: [...habitInfoData, ...habitInfo],
        pageNo: pageNo + 1,
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 切换tab事件
  changeTabs = async (tabs, index) => {
    const { pageNo, pageSize } = this.state;

    await this.setState({ pageNo: 1, habitInfoData: [] });

    let tabsReq = {};
    for (let prop in tabs) {
      if (prop !== 'title') {
        tabsReq[prop] = tabs[prop];
      }
    }
    const req = { ...tabsReq, my_habit: 'my_habit', pageNo: 1, pageSize };
    await this.getHabitInfoRecord(req);
  };

  // 查看记录详情
  clickRecordDetail = id => {
    const { history } = this.props;
    history.push(`/home/record/detail/${id}`);
  };

  // 查看习惯详情
  clickHabit = id => {
    const { history } = this.props;
    history.push(`/home/habit/detail/${id}`);
  };

  // 无限加载数据
  handleScroll = e => {
    let { isLoadFinish, isLoading, pageNo, pageSize } = this.state;
    const { scrollHeight, scrollTop, clientHeight } = e.target;

    if (scrollTop + clientHeight + 30 >= scrollHeight && !isLoadFinish && !isLoading) {
      const req = { my_habit: 'my_habit', pageNo, pageSize };
      throttle(this.getHabitInfoRecord(req), 250);
    }
  };

  render() {
    const { habitInfoData } = this.state;
    const { history } = this.props;
    const tabs = [
      { title: '所有习惯' },
      { title: '全天习惯', time_of_days: '0' },
      { title: '晨间习惯', time_of_days: '1' },
      { title: '午间习惯', time_of_days: '2' },
      { title: '夜间习惯', time_of_days: '3' },
    ];

    return (
      <div className={classNames(styles.container, 'recordtabsContainer')} ref={this.containRef}>
        <NavBar
          mode="dark"
          rightContent={[
            <div onClick={() => this.clickRecordDetail(1)} key="0">
              <i className={classNames(styles.plus, 'icon-record', 'iconfont')} />
            </div>,
          ]}
          style={{ position: 'sticky', top: 0, zIndex: 2, marginBottom: '1rem' }}
        >
          记录
        </NavBar>
        <Tabs
          tabs={tabs}
          tabBarActiveTextColor="#624196e3"
          tabBarUnderlineStyle={{ backgroundColor: '#624196e3' }}
          tabBarTextStyle={{ fontWeight: 'bold' }}
          renderTabBar={props => <Tabs.DefaultTabBar {...props} page={3} />}
          onChange={this.changeTabs}
        >
          <HabitList history={history} habitInfoData={habitInfoData} handleClickHabit={this.clickHabit} />
        </Tabs>
      </div>
    );
  }
}

export default HomeRecord;
