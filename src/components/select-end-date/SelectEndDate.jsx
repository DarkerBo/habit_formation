import React, { Component } from 'react';
import { NavBar, Accordion, List, Icon, Checkbox, DatePicker, Toast } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './SelectEndDate.scss';
import moment from 'moment';

class SelectEndDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeKey: '0', // 手风琴打开的key值
      checkedCountless: false, // 无数次复选框的值
      endDate: '', // 结束时间
    };
  }

  // 改变结束时间事件
  changeEndData = date => {
    this.setState({ endDate: date });
  };

  // 回退按钮
  clickBack = () => {
    this.props.closeSelectEndDate();
  };

  // 完成按钮
  finishSelect = () => {
    const { checkedCountless, endDate } = this.state;
    let result;

    // 如果没有选择，则弹出提示
    if (!checkedCountless && !endDate) return Toast.info('请选择结束时间', 2);

    if (checkedCountless) {
      result = { value: 0, label: '永久' };
    } else if (endDate) {
      result = { value: moment(endDate).format('YYYY-MM-DD'), label: moment(endDate).format('YYYY-MM-DD') };
    }
    this.props.changeDays(result);
    this.props.closeSelectEndDate();
  };

  // 改变无数次选项的状态
  onChangeTimeCheck = () => {
    this.setState({
      checkedCountless: !this.state.checkedCountless,
    });
  };

  // 改变手风琴的时候初始化数据
  onAccordionChange = key => {
    this.setState({
      endDate: '',
      checkedCountless: false,
      activeKey: key,
    });
  };

  render() {
    const { activeKey, checkedCountless, endDate } = this.state;

    return (
      <div className={styles.container}>
        {/* 顶部栏 */}
        <NavBar
          icon={<Icon type="left" size="lg" />}
          onLeftClick={this.clickBack}
          rightContent={<div onClick={this.finishSelect}>完成</div>}
          mode="dark"
          style={{ position: 'sticky', top: 0, zIndex: 2 }}
        >
          结束时间
        </NavBar>
        <Accordion accordion onChange={this.onAccordionChange} activeKey={activeKey}>
          <Accordion.Panel header="永久" key="0">
            <List>
              <Checkbox.CheckboxItem checked={checkedCountless} onChange={this.onChangeTimeCheck}>
                永久
              </Checkbox.CheckboxItem>
            </List>
          </Accordion.Panel>
          <Accordion.Panel header="选择时间" key="1">
            <List>
              <DatePicker
                mode="date"
                title="选择结束日期"
                value={endDate}
                onChange={this.changeEndData}
                minDate={new Date()}
                maxDate={new Date(2050, 1, 1, 23, 59, 59)}
              >
                <List.Item arrow="horizontal">自定义日期</List.Item>
              </DatePicker>
            </List>
          </Accordion.Panel>
        </Accordion>
      </div>
    );
  }
}

export default SelectEndDate;
