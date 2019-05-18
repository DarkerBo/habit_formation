import React, { Component } from 'react';
import { NavBar, Icon, List, Modal, Switch, Picker, TextareaItem, InputItem, Toast } from 'antd-mobile';
import styles from './CreateHabit.module.scss';
import '@/assets/styles/navbar.scss';
import { dayTimeData } from './pickerData';
import SelectDays from '@/components/select-days/SelectDays';
import SelectEndDate from '@/components/select-end-date/SelectEndDate';
import validateForm from '@/utils/form-validation';
import { getNicknameLegal } from '@/services/user';
import { createOrEditHabit, getHabitInfo } from '@/services/habit';
import { createOrEditClock } from '@/services/clock';
import { createOrEditMessage } from '@/services/message';

class CreateHabit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      habitName: '', // 习惯名称
      dayTimeValue: [], // 选择时分的值
      checked: false, // 是否为重要习惯
      supervisor: '', // 申请的监督人昵称
      isSelectDay: false, // 是否点击了选择频率
      selectDays: { type: '', frequency: '', label: '' }, // 选择的频率
      isSelectEndDate: false, // 是否点击了结束时间
      selectEndDate: { value: '', label: '' }, // 选择结束时间
      completionTimes: '', // 完成次数
      encourage: '', // 鼓励的话
    };
  }

  // 回退按钮
  clickBack = () => {
    const { history } = this.props;
    history.goBack();
  };

  // 修改习惯名字
  changeHabitName = value => {
    this.setState({
      habitName: value,
    });
  };

  // 修改鼓励的话
  changeEncourage = value => {
    this.setState({
      encourage: value,
    });
  };

  // 完成按钮
  finishHabit = async () => {
    const {
      habitName,
      selectDays,
      dayTimeValue,
      completionTimes,
      selectEndDate,
      checked,
      encourage,
      supervisor,
    } = this.state;
    const { type, frequency } = selectDays;
    const { history } = this.props;

    const validateMessage = validateForm([
      { value: habitName, name: '习惯名称', required: true, maxLength: 15 },
      { value: type, name: '习惯频率', required: true },
      { value: frequency, name: '习惯频率', required: true },
      { value: dayTimeValue[0], name: '时分', required: true },
      { value: encourage, name: '鼓励的话', maxLength: 40 },
    ]);
    if (validateMessage) return Toast.info(validateMessage, 1);

    if (selectEndDate.value === '') return Toast.info('结束时间不能为空', 1);

    const posInteger = /^[1-9]\d*$/;
    if (!posInteger.test(completionTimes)) return Toast.info('完成次数应为正整数', 1);

    // 如果有申请监督人，根据昵称判断该监督人存不存在，管理员和自己都不能成为监督人
    let nicknameResult = null;
    if (supervisor !== '') {
      const nicknameReq = { nickname: supervisor };
      nicknameResult = await getNicknameLegal(nicknameReq);
      if (nicknameResult.data.code === '1') return Toast.info(nicknameResult.data.message, 1);
    }

    const req = {
      name: habitName,
      type,
      frequency,
      time_of_days: dayTimeValue[0],
      completion_times: completionTimes,
      end_time: selectEndDate.value,
      sign: checked ? '1' : '0',
      encourage,
      superintendent_id: '',
    };

    const result = await createOrEditHabit(req);
    if (result.data.code === '0') {
      // 创建成功后获取刚刚创建的习惯的ID，生成一条未打卡记录
      const habitInfo = await getHabitInfo();
      if (habitInfo.data.code === '1') return Toast.info(habitInfo.data.message, 1);
      // 创建完习惯后生成一条未打卡的记录
      const clockReq = {
        habit_id: habitInfo.data.data[0].id,
        status: '0',
      };
      const clockResult = await createOrEditClock(clockReq);
      if (clockResult.data.code === '1') return Toast.info(clockResult.data.message, 1);

      // 如果有申请监督人，监督人存在，发送一条邀请监督的消息
      if (nicknameResult && nicknameResult.data.code === '0') {
        const user1_id = nicknameResult.data.data.user_id;
        const habit_id = habitInfo.data.data[0].id;
        const messageReq = { content: `邀请成为'${habitName}'习惯的监督人`, status: '1', user1_id, habit_id };
        const messageResult = await createOrEditMessage(messageReq);
        if (messageResult.data.code === '1') return Toast.info(messageResult.data.message, 1);
      }

      Toast.info('新建习惯成功', 1);
      history.push('/home/record');
    } else {
      Toast.info(result.data.message, 1);
    }
  };

  // 持续时分picker点击确定事件
  onDayTimePickerOk = value => {
    this.setState({
      dayTimeValue: value,
    });
  };

  // 改变滑动开关状态
  toggleChecked = () => {
    this.setState({
      checked: !this.state.checked,
    });
  };

  // 选择频率页面显示
  toggleSelect = key => {
    this.setState({
      [key]: !this.state[key],
    });
  };

  // 选择频率数据传递
  onChangeDays = obj => {
    this.setState({
      selectDays: obj,
    });
  };

  // 完成天数输入
  changeCompletionTimes = value => {
    this.setState({
      completionTimes: value,
    });
  };

  // 选择结束时间数据传递
  onChangeEndDate = value => {
    this.setState({
      selectEndDate: value,
    });
  };

  // 显示设置监督人模态框
  showSupervisorModal = () => {
    // 需要用promise才不会报错
    Modal.prompt(
      '申请监督',
      '',
      [
        {
          text: '取消',
          onPress: value =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
              }, 0);
            }),
        },
        {
          text: '确定',
          onPress: value =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                if (value === '') {
                  reject();
                  Toast.info('监督人昵称不能为空', 1);
                } else {
                  resolve();
                  this.setState({
                    supervisor: value,
                  });
                }
              }, 0);
            }),
        },
      ],
      'default',
      null,
      ['输入监督人的昵称']
    );
  };

  render() {
    const {
      habitName,
      dayTimeValue,
      checked,
      supervisor,
      isSelectDay,
      selectDays,
      isSelectEndDate,
      selectEndDate,
      completionTimes,
      encourage,
    } = this.state;
    if (isSelectDay) {
      // 选择频率组件
      return <SelectDays closeSelectDays={() => this.toggleSelect('isSelectDay')} changeDays={this.onChangeDays} />;
    } else if (isSelectEndDate) {
      // 选择完成天数组件
      return (
        <SelectEndDate
          closeSelectEndDate={() => this.toggleSelect('isSelectEndDate')}
          changeDays={this.onChangeEndDate}
        />
      );
    } else {
      return (
        <div className={styles.container}>
          {/* 顶部栏 */}
          <NavBar
            icon={<Icon type="left" size="lg" />}
            onLeftClick={this.clickBack}
            rightContent={<div onClick={this.finishHabit}>完成</div>}
            mode="dark"
            style={{ position: 'sticky', top: 0, zIndex: 2 }}
          >
            新建习惯
          </NavBar>

          {/* 习惯名称 */}
          <List renderHeader={() => '习惯名称'} className={styles.operation}>
            <TextareaItem
              title="习惯"
              placeholder="字数不超过15"
              data-seed="habitId"
              labelNumber={3}
              autoHeight
              count={15}
              value={habitName}
              onChange={this.changeHabitName}
            />
          </List>

          {/* 操作列表 */}
          <List renderHeader={() => '基本设置'} className={styles.operation}>
            <List.Item
              onClick={() => this.toggleSelect('isSelectDay')}
              arrow="horizontal"
              extra={<span>{selectDays.label}</span>}
            >
              习惯频率
            </List.Item>

            <InputItem
              clear
              placeholder="输入正整数"
              labelNumber={5}
              value={completionTimes}
              onChange={this.changeCompletionTimes}
            >
              完成次数
            </InputItem>

            <Picker data={dayTimeData} cols={1} value={dayTimeValue} onOk={this.onDayTimePickerOk}>
              <List.Item arrow="horizontal">设置时分</List.Item>
            </Picker>

            <List.Item
              arrow="horizontal"
              onClick={() => this.toggleSelect('isSelectEndDate')}
              extra={<span>{selectEndDate.label}</span>}
            >
              约定结束时间
            </List.Item>

            <List.Item
              onClick={this.toggleChecked}
              arrow="horizontal"
              extra={<Switch checked={checked} color="#624196e3" onClick={this.toggleChecked} />}
            >
              是否为重要习惯
            </List.Item>

            <TextareaItem
              title="鼓励的话"
              placeholder="字数不超过40"
              data-seed="mottomId"
              labelNumber={5}
              autoHeight
              count={40}
              value={encourage}
              onChange={this.changeEncourage}
            />
          </List>

          {/* 监督列表 */}
          <List renderHeader={() => '申请监督人有利于更好的完成习惯哦'} className={styles.operation}>
            <List.Item onClick={this.showSupervisorModal} arrow="horizontal" extra={<span>{supervisor}</span>}>
              申请监督
            </List.Item>
          </List>
        </div>
      );
    }
  }
}

export default CreateHabit;
