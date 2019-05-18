import React, { Component } from 'react';
import { NavBar, Icon, Toast } from 'antd-mobile';
import styles from './MyLogs.module.scss';
import '@/assets/styles/navbar.scss';
import LogList from '@/components/log-list/LogList';
import { getLogInfo, createLogLike, deleteLogLike, getLogDetail } from '@/services/log';

class MyLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logInfo: null, // 日志列表信息
      uid: window.localStorage.getItem('uid'), // 当前用户的ID
    };
  }

  componentDidMount() {
    this.getLogInfoRecord();
  }

  // 获取我的日志列表
  getLogInfoRecord = async () => {
    const req = { pageNo: 1, pageSize: 100000000 };
    const result = await getLogInfo(req);
    if (result.data.code === '0') {
      this.setState({
        logInfo: result.data.data,
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

  // 改变特定日志的状态
  setLogStatus = async (id, index) => {
    const { logInfo } = this.state;
    const logReq = { id };
    const logResult = await getLogDetail(logReq);
    if (logResult.data.code === '1') return Toast.info(logResult.data.message, 1);
    logInfo[index] = logResult.data.data[0];
    this.setState({
      logInfo,
    });
  };

  // 改变点赞状态
  changeLike = async id => {
    const { logInfo } = this.state;

    // 只改变状态变化的那天日志数据，而不是整个日志数组
    const changeLikeIndex = logInfo.findIndex(item => item.id === id);

    if (!logInfo[changeLikeIndex].pid) {
      const req = { log_id: id };
      const result = await createLogLike(req);
      if (result.data.code === '1') return Toast.info(result.data.message, 1);
      this.setLogStatus(id, changeLikeIndex);
      Toast.info('点赞成功！', 1);
    } else {
      const req = { log_id: id };
      const result = await deleteLogLike(req);
      if (result.data.code === '1') return Toast.info(result.data.message, 1);
      this.setLogStatus(id, changeLikeIndex);
      Toast.info('取消点赞成功！', 1);
    }
  };

  // 点击评论
  clickComment = id => {
    const { history } = this.props;
    history.push(`/home/log/detail/${id}`);
  };

  render() {
    const { logInfo } = this.state;

    return (
      <div className={styles.container}>
        {/* 顶部栏 */}
        <NavBar
          mode="dark"
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          我的日志
        </NavBar>
        <LogList logInfo={logInfo} clickLogComment={this.clickComment} changeLogLike={this.changeLike} />
      </div>
    );
  }
}

export default MyLogs;
