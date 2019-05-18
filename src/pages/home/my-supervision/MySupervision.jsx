import React, { Component } from 'react';
import { NavBar, Icon, Toast } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './MySupervision.module.scss';
import HabitList from '@/components/habit-list/HabitList';
import { getHabitInfo } from '@/services/habit';

class MySupervision extends Component {
  constructor(props) {
    super(props);
    this.state = {
      habitInfoData: null, // 习惯信息
    };
  }

  componentDidMount() {
    this.getHabitInfoRecord();
  }

  // 获取该用户习惯信息
  getHabitInfoRecord = async () => {
    const req = { my_superintendent: 'my_superintendent', pageNo: 1, pageSize: 1000 };
    const result = await getHabitInfo(req);
    if (result.data.code === '0') {
      const habitInfoData = result.data.data;

      this.setState({
        habitInfoData,
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

  // 查看习惯详情
  clickHabit = id => {
    const { history } = this.props;
    history.push(`/home/habit/detail/${id}`);
  };

  render() {
    const { habitInfoData } = this.state;
    const { history } = this.props;

    return (
      <div className={styles.container}>
        <NavBar
          mode="dark"
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          我的监督
        </NavBar>

        <HabitList history={history} habitInfoData={habitInfoData} handleClickHabit={this.clickHabit} />
      </div>
    );
  }
}

export default MySupervision;
