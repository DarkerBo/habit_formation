import React, { Component } from 'react';
import { NavBar, Icon, List, Steps, Toast } from 'antd-mobile';
import { DatePicker } from 'antd';
import '@/assets/styles/navbar.scss';
import styles from './RecordDetail.module.scss';
import './RecordDetail.scss';
import classNames from 'classnames';
import { getClockInfo } from '@/services/clock';

class RecordDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordInfo: null,
    };
  }

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  renderBtn(title) {
    return (
      <List.Item
        arrow="horizontal"
        onClick={() => {
          document.getElementsByTagName('body')[0].style.overflowY = 'hidden';
          this.setState({
            showCalendar: true,
          });
        }}
      >
        {title}
      </List.Item>
    );
  }

  onChange = async (date, dateString) => {
    if (dateString === '') {
      this.setState({
        recordInfo: null,
      });
      return;
    }
    const req = { create_time: dateString };
    const result = await getClockInfo(req);
    if (result.data.code === '0') {
      this.setState({
        recordInfo: result.data.data,
      });
    } else {
      return Toast.info(result.data.message, 1);
    }
  };

  render() {
    const { recordInfo } = this.state;

    return (
      <div className={classNames(styles.container, 'recordDetailContainer')}>
        {/* 顶部栏 */}
        <NavBar
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          mode="dark"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          打卡记录详情
        </NavBar>

        <List>
          <DatePicker onChange={this.onChange} size="large" dropdownClassName="recordDatePicker" />
        </List>

        <div className={styles.title}>打卡记录</div>
        {!recordInfo || recordInfo.length < 1 ? (
          <div className={styles.empty}>
            <i className={classNames(styles.emptyIcon, 'icon-empty', 'iconfont')} />
            <span>该日期没有打卡记录~</span>
          </div>
        ) : (
          <div className={styles.stepsContainer}>
            <Steps>
              {recordInfo.map(item => (
                <Steps.Step
                  key={item.id}
                  status={item.status === '1' ? 'process' : 'error'}
                  title={item.name}
                  description={item.status === '1' ? '该习惯当天已完成打卡' : '该习惯当天未完成打卡'}
                  icon={
                    item.status === '1' && (
                      <i className={classNames(styles.passIcon, 'icon-dagouyouquan', 'iconfont')} />
                    )
                  }
                />
              ))}
            </Steps>
          </div>
        )}
      </div>
    );
  }
}

export default RecordDetail;
