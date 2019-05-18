import React, { Component } from 'react';
import styles from './HabitList.module.scss';
import classNames from 'classnames';

class HabitList extends Component {
  // 查看习惯详情
  clickHabit = id => {
    this.props.handleClickHabit(id);
  };

  // 渲染习惯状态
  renderStatus = status => {
    switch (status) {
      case '0':
        return <span className={styles.undone}>未完成</span>;
      case '1':
        return <span className={styles.processing}>进行中</span>;
      case '2':
        return <span className={styles.completed}>已完成</span>;
      default:
        break;
    }
  };

  // 渲染监督人情况
  renderSuperintendent = item => {
    const uid = Number(window.localStorage.getItem('uid'));

    if (!item.superintendent_id) {
      return (
        <div className={styles.supervise}>
          <span className={styles.superviseText}>独立完成</span>
        </div>
      );
    } else if (item.superintendent_id !== uid) {
      return (
        <div className={styles.supervise}>
          <span className={styles.superviseText}>监督人</span>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {item.avatar ? (
                <img src={item.avatar} alt="头像" className={styles.image} />
              ) : (
                <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
              )}
            </div>
            <span className={styles.superviseName}>{item.nickname}</span>
          </div>
        </div>
      );
    } else if (item.superintendent_id === uid) {
      return (
        <div className={styles.supervise}>
          <span className={styles.superviseText}>被监督人：</span>
          <div className={styles.user}>
            <div className={styles.avatar}>
              {item.avatar2 ? (
                <img src={item.avatar2} alt="头像" className={styles.image} />
              ) : (
                <i className={classNames(styles.userIcon, 'icon-touxiang', 'iconfont')} />
              )}
            </div>
            <span className={styles.superviseName}>{item.nickname2}</span>
          </div>
        </div>
      );
    }
  };

  render() {
    const { habitInfoData } = this.props;

    const dayTimeObj = {
      '0': { icon: 'icon-icon-', color: styles.allDayColor },
      '1': { icon: 'icon-zaoshang', color: styles.morningColor },
      '2': { icon: 'icon-zhongwu', color: styles.afternoonColor },
      '3': { icon: 'icon-wanshang', color: styles.eveningColor },
    };

    return (
      <div className={styles.habitList}>
        {!habitInfoData || habitInfoData.length < 1 ? (
          <div className={styles.empty}>
            <i className={classNames(styles.emptyIcon, 'icon-empty', 'iconfont')} />
            <span>没有对应习惯哦~</span>
          </div>
        ) : (
          <div className={styles.habitItemContainer}>
            {habitInfoData.map(item => (
              <div className={styles.habitItem} key={item.id} onClick={() => this.clickHabit(item.id)}>
                <div className={classNames(styles.habit, dayTimeObj[item.time_of_days].color)}>
                  <i className={classNames(styles.dayTimeIcon, dayTimeObj[item.time_of_days].icon, 'iconfont')} />
                  <div className={styles.habitDetail}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.motto}>{item.encourage}</span>
                  </div>
                  {item.sign === '1' && <i className={classNames(styles.star, 'icon-star', 'iconfont')} />}
                </div>

                <div className={styles.recordContainer}>
                  <div className={styles.record}>
                    <span className={styles.recordText}>状态</span>
                    {this.renderStatus(item.status)}
                  </div>
                  <div className={styles.record}>
                    <span className={styles.recordText}>共完成次数</span>
                    <div className={styles.recordDaysContainer}>
                      <span className={styles.recordDays}>{item.clock_count}</span>
                    </div>
                  </div>
                  <div className={styles.record}>
                    <span className={styles.recordText}>约定次数</span>
                    <div className={styles.recordDaysContainer}>
                      <span className={styles.recordDays}>{item.completion_times}</span>
                    </div>
                  </div>
                </div>

                {this.renderSuperintendent(item)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default HabitList;
