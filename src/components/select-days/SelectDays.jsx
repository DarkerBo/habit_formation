import React, { Component } from 'react';
import { NavBar, Accordion, List, Icon, Checkbox, Picker, Toast } from 'antd-mobile';
import '@/assets/styles/navbar.scss';
import styles from './SelectDays.module.scss';
import { weekData, everyWeekData, everyMonthData } from './data.js';

class SelectDays extends Component {
  constructor(props) {
    super(props);
    this.state = {
      everyWeekValue: [], // 每月几天picker值
      everyMonthValue: [], // 每周几天picker值
      checkedWeekArr: new Array(7).fill(false), // 每周周几复选框值的数组
      checkedDay: false, // 每天复选框的值
      activeKey: '0', // 手风琴打开的key值
    };
  }

  // 每周几的复选框改变事件
  onChangeWeekCheck = key => {
    const { checkedWeekArr } = this.state;
    checkedWeekArr[key - 1] = !checkedWeekArr[key - 1];
    if (checkedWeekArr.every(i => i)) {
      this.setState({
        activeKey: '0',
        checkedDay: true,
      });
    } else {
      this.setState({
        checkedWeekArr,
      });
    }
  };

  // 每天的复选框改变事件
  onChangeDayCheck = key => {
    this.setState({
      checkedDay: !this.state.checkedDay,
    });
  };

  // 回退按钮
  clickBack = () => {
    this.props.closeSelectDays();
  };

  // 完成按钮
  finishSelect = () => {
    const { everyWeekValue, everyMonthValue, checkedWeekArr, checkedDay } = this.state;
    const weekArr = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    let result;

    // 如果没有选择，则弹出提示
    if (!everyWeekValue.length && !everyMonthValue.length && !checkedWeekArr.includes(true) && !checkedDay) {
      return Toast.info('请选择一种习惯频率', 1);
    }

    if (checkedDay) {
      result = { type: '0', frequency: '1', label: '每天' };
    } else if (checkedWeekArr.includes(true)) {
      let arr = [];
      let strArr = [];
      checkedWeekArr.forEach((item, index) => {
        if (item) {
          arr.push(weekArr[index]);
          strArr.push(index + 1);
        }
      });
      result = { type: '3', frequency: strArr.join(), label: `每${arr.toString()}` };
    } else if (everyWeekValue.length) {
      result = { type: '1', frequency: everyWeekValue[0], label: `每周${everyWeekValue[0]}天` };
    } else if (everyMonthValue.length) {
      result = { type: '2', frequency: everyMonthValue[0], label: `每月${everyMonthValue[0]}天` };
    }
    this.props.changeDays(result);
    this.props.closeSelectDays();
  };

  // 每周Picker的确定事件
  onEveryWeekPickerOk = value => {
    this.setState({
      everyWeekValue: value,
    });
  };

  // 每月Picker的确定事件
  onEveryMonthPickerOk = value => {
    this.setState({
      everyMonthValue: value,
    });
  };

  // 改变手风琴的时候初始化数据
  onAccordionChange = key => {
    this.setState({
      everyWeekValue: [],
      everyMonthValue: [],
      checkedWeekArr: new Array(7).fill(false),
      checkedDay: false,
      activeKey: key,
    });
  };

  render() {
    const { everyWeekValue, everyMonthValue, checkedWeekArr, checkedDay, activeKey } = this.state;

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
          习惯频率
        </NavBar>
        <Accordion accordion onChange={this.onAccordionChange} activeKey={activeKey}>
          <Accordion.Panel header="每天" key="0">
            <List>
              <Checkbox.CheckboxItem checked={checkedDay} onChange={this.onChangeDayCheck}>
                每天
              </Checkbox.CheckboxItem>
            </List>
          </Accordion.Panel>
          <Accordion.Panel header="每周" key="1">
            <List>
              {weekData.map(item => (
                <Checkbox.CheckboxItem
                  key={item.value}
                  onChange={() => this.onChangeWeekCheck(item.value)}
                  checked={!!checkedWeekArr[Number(item.value) - 1]}
                >
                  {item.label}
                </Checkbox.CheckboxItem>
              ))}
            </List>
          </Accordion.Panel>
          <Accordion.Panel header="每周X天" key="2">
            <Picker data={everyWeekData} cols={1} value={everyWeekValue} onOk={this.onEveryWeekPickerOk}>
              <List.Item arrow="horizontal">每周</List.Item>
            </Picker>
          </Accordion.Panel>
          <Accordion.Panel header="每月X天" key="3">
            <Picker data={everyMonthData} cols={1} value={everyMonthValue} onOk={this.onEveryMonthPickerOk}>
              <List.Item arrow="horizontal">每月</List.Item>
            </Picker>
          </Accordion.Panel>
        </Accordion>
      </div>
    );
  }
}

export default SelectDays;
