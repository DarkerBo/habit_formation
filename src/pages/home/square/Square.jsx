import React, { Component } from 'react';
import { NavBar, Toast } from 'antd-mobile';
import styles from './Square.module.scss';
import '@/assets/styles/navbar.scss';
import classNames from 'classnames';
import LogList from '@/components/log-list/LogList';
import { getLogList, createLogLike, deleteLogLike, getLogDetail } from '@/services/log';
import throttle from '@/utils/throttle';

class HomeSquare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logInfo: [], // 日志列表信息
      uid: window.localStorage.getItem('uid'), // 当前用户的ID
      isLoadFinish: false, // 数据是否已经加载完成
      isLoading: false, // 是否正在获取数据
      pageNo: 1,
      pageSize: 5,
    };
  }

  componentDidMount() {
    this.getLogListInfo();
  }

  // 获取日志列表
  getLogListInfo = async () => {
    const { pageNo, pageSize, logInfo } = this.state;
    const req = { pageNo, pageSize };

    this.setState({ isLoading: true });
    const result = await getLogList(req);
    this.setState({ isLoading: false });

    if (result.data.code === '0') {
      if (result.data.data.result.length < pageSize) this.setState({ isLoadFinish: true });
      this.setState({
        logInfo: [...result.data.data.result, ...logInfo],
        pageNo: pageNo + 1,
      });
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 新建日志事件
  createLog = () => {
    const { history } = this.props;
    history.push('/home/log/create');
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

  // 无限加载数据
  handleScroll = e => {
    let { isLoadFinish, isLoading } = this.state;
    const { scrollHeight, scrollTop, clientHeight } = e.target;

    if (scrollTop + clientHeight + 30 >= scrollHeight && !isLoadFinish && !isLoading) {
      throttle(this.getLogListInfo(), 250);
    }
  };

  render() {
    const { logInfo } = this.state;

    return (
      <div className={styles.container} onScroll={this.handleScroll}>
        {/* 顶部栏 */}
        <NavBar
          mode="dark"
          rightContent={[
            <div key="0" onClick={this.createLog}>
              <i className={classNames(styles.edit, 'icon-edit', 'iconfont')} />
            </div>,
          ]}
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          广场
        </NavBar>
        <div className={styles.bannerContainer}>
          <img src={require('./square.jpg')} alt="封面" className={styles.bannerImage} />
        </div>
        <LogList clickLogComment={this.clickComment} changeLogLike={this.changeLike} logInfo={logInfo} />
      </div>
    );
  }
}

export default HomeSquare;
