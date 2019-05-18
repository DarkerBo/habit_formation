import React, { Component } from 'react';
import styles from './Habit.module.scss';
import './Habit.scss';
import { Form, Select, Input, Button, DatePicker, Avatar, Tag, Pagination, Empty, message, Modal } from 'antd';
import classNames from 'classnames';
import validateForm from '@/utils/form-validation';
import moment from 'moment';
import { getHabitList } from '@/services/habit';
import {
  createOrEditMessage,
  createMessageDetail,
  getMessageInfo,
  modifyMessageInfo,
  changeMessageRead,
} from '@/services/message';

class AdminHabit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '', // 习惯名称
      account: '', // 用户名
      createdTime: '', // 创建日期
      status: '', // 习惯状态
      timeOfDay: '', // 习惯时分
      isClock: '', // 今天打卡情况
      listData: [], // 列表数据
      pageNo: 1, // 第几页
      pageSize: 6, // 一页的数据数量
      totalCount: 0, // 数据总数
      saveCondition: {}, // 保存的查询条件
      visible: false, // 模态框显示
      title: '', // 模态框标题
      messageContent: '', // 消息内容
      habit_id: '', //点击的习惯ID
      user_id: '', //点击的用户ID
    };
  }

  componentDidMount() {
    this.getHabitListInfo();
  }

  // 获取日志列表
  getHabitListInfo = async () => {
    const { pageNo, pageSize, saveCondition } = this.state;

    const validateMessage = [{ name: '用户名', value: saveCondition.account, maxLength: 15 }];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return message.error(messageResult);

    const result = await getHabitList({ ...saveCondition, pageNo, pageSize });
    if (result.data.code === '0') {
      const listData = result.data.data.result;

      this.setState({
        listData,
        totalCount: result.data.data.totalCount,
      });
    } else {
      message.error(result.data.message);
    }
  };

  // 分页页面改变事件
  onPageChange = async pageNo => {
    await this.setState({ pageNo });
    this.getHabitListInfo();
  };

  // 保存查询条件
  saveQueryCondition = () => {
    const { name, account, createdTime, status, timeOfDay, isClock } = this.state;
    const saveCondition = {
      name,
      account,
      create_time: createdTime,
      status,
      time_of_days: timeOfDay,
      cstatus: isClock,
    };
    this.setState({
      saveCondition,
    });
  };

  // 点击查询语句
  handleSearch = async () => {
    await this.saveQueryCondition();
    this.getHabitListInfo();
  };

  //重置查询表单
  resetQueryForm = async () => {
    await this.setState({
      name: '',
      account: '',
      createdTime: '',
      status: '',
      timeOfDay: '',
      isClock: '',
      pageNo: 1,
    });
    this.handleSearch();
  };

  showModal = (status, habit_id, user_id) => {
    this.setState({
      title: status === '0' ? '鼓励用户' : '提醒用户',
      visible: true,
      habit_id,
      user_id,
    });
  };

  // 点击发送事件
  handleOk = async () => {
    const { messageContent, habit_id, user_id } = this.state;

    const validateMessage = [{ name: '消息内容', value: messageContent, maxLength: 100 }];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return message.error(messageResult);

    // 获取有没有该习惯的主消息，没有则生成一个
    const req = { habit_id, pageNo: 1, pageSize: 1 };
    const messageInfoResult = await getMessageInfo(req);
    if (messageInfoResult.data.code === '1') return message.error(messageInfoResult.data.message);

    let message_id;
    if (!messageInfoResult.data.data[0]) {
      // 创建主消息
      const result = await createOrEditMessage({ content: messageContent, habit_id, user1_id: user_id, status: '0' });
      if (result.data.code === '1') return message.error(result.data.message);
      // 获取刚创建的主消息的ID
      const messageResult = await getMessageInfo(req);
      if (messageResult.data.code === '1') return message.error(messageResult.data.message);
      message_id = messageResult.data.data[0].id;
    } else {
      // 改变主消息的内容
      message_id = messageInfoResult.data.data[0].id;
      const messageReq = { id: message_id, content: messageContent, status: '0' };
      const messageResult = await modifyMessageInfo(messageReq);
      if (messageResult.data.code === '1') return message.error(messageResult.data.message);

      // 改变主消息的已读状态
      const readReq = { id: message_id, read: '0' };
      const readResult = await changeMessageRead(readReq);
      if (readResult.data.code === '1') return message.error(readResult.data.message);
    }

    // 创建二级消息
    const messageDetailReq = { content: messageContent, message_id, user1_id: user_id };
    const messageDetailResult = await createMessageDetail(messageDetailReq);
    if (messageDetailResult.data.code === '1') return message.error(messageDetailResult.data.message);

    message.success('发送消息成功');
    this.setState({
      visible: false,
    });
  };

  // 点击取消事件
  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  // 改变下拉选择框选择事件
  handleChange = (value, key) => {
    this.setState({
      [key]: value,
    });
  };

  // 时期选择器值改变事件
  onDateChange = (date, dateString) => {
    this.setState({
      createdTime: date,
    });
  };

  // 习惯名称输入框输入事件
  changeName = e => {
    this.setState({
      name: e.target.value,
    });
  };

  // 用户名输入框输入事件
  changeAccount = e => {
    this.setState({
      account: e.target.value,
    });
  };

  // 信息发送输入框输入事件
  changeMessage = e => {
    this.setState({
      messageContent: e.target.value,
    });
  };

  // 渲染习惯时分
  renderTimeOfDay = time_of_days => {
    switch (time_of_days) {
      case '0':
        return <Tag color="#80dd84">全天习惯</Tag>;
      case '1':
        return <Tag color="#e18184">晨间习惯</Tag>;
      case '2':
        return <Tag color="#dbbc4b">午间习惯</Tag>;
      case '3':
        return <Tag color="#82cedf">夜间习惯</Tag>;
      default:
        return;
    }
  };

  // 渲染习惯状态
  renderLogStatus = status => {
    switch (status) {
      case '0':
        return <span className={styles.undone}>未完成</span>;
      case '1':
        return <span className={styles.processing}>进行中</span>;
      case '2':
        return <span className={styles.completed}>已完成</span>;
      default:
        return;
    }
  };

  // 渲染今天是否需要打卡
  renderTodayIsNeedClock = (status, type, frequency) => {
    const weekDay = new Date().getDay().toString() === '0' ? '7' : new Date().getDay().toString();
    const todayIsNeedClock = status === '1' && (type !== '3' || (type === '3' && frequency.includes(weekDay)));

    return todayIsNeedClock ? '今天需要打卡' : '今天不需要打卡';
  };

  // 渲染今天是否已打卡
  renderTodayIsClock = cstatus => {
    const todayIsClock = cstatus === '1';

    return todayIsClock ? '今天已打卡' : '今天没有打卡';
  };

  render() {
    const {
      name,
      account,
      status,
      timeOfDay,
      isClock,
      listData,
      pageNo,
      pageSize,
      totalCount,
      visible,
      title,
      messageContent,
    } = this.state;

    return (
      <div className={styles.container}>
        {/* 搜索栏 */}
        <div className={styles.manageContainer}>
          <Form className={styles.manageForm} layout="inline">
            <Form.Item label="习惯名：" className={styles.manageFormItem}>
              <Input placeholder="habitname" value={name} onChange={this.changeName} />
            </Form.Item>
            <Form.Item label="用户名：" className={styles.manageFormItem}>
              <Input placeholder="username" value={account} onChange={this.changeAccount} />
            </Form.Item>
            <Form.Item label="创建日期：" className={styles.manageFormItem}>
              <DatePicker onChange={this.onDateChange} />
            </Form.Item>
            <Form.Item label="习惯时分：" className={styles.manageFormItem}>
              <Select
                showSearch
                style={{ width: 180 }}
                placeholder="Select a daytime"
                optionFilterProp="children"
                onChange={value => this.handleChange(value, 'timeOfDay')}
                value={timeOfDay}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Select.Option value="0">所有时分</Select.Option>
                <Select.Option value="1">晨间习惯</Select.Option>
                <Select.Option value="2">午间习惯</Select.Option>
                <Select.Option value="3">夜间习惯</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="习惯状态：" className={styles.manageFormItem}>
              <Select
                showSearch
                style={{ width: 180 }}
                placeholder="Select a status"
                optionFilterProp="children"
                onChange={value => this.handleChange(value, 'status')}
                value={status}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Select.Option value="">所有状态</Select.Option>
                <Select.Option value="0">未完成</Select.Option>
                <Select.Option value="1">进行中</Select.Option>
                <Select.Option value="2">已完成</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="今天打卡情况：" className={styles.manageFormItem}>
              <Select
                showSearch
                style={{ width: 180 }}
                placeholder="Select a daytime"
                optionFilterProp="children"
                onChange={value => this.handleChange(value, 'isClock')}
                value={isClock}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                <Select.Option value="">所有情况</Select.Option>
                <Select.Option value="0">未打卡</Select.Option>
                <Select.Option value="1">已打卡</Select.Option>
              </Select>
            </Form.Item>

            <Button type="primary" htmlType="submit" className={styles.queryButton} onClick={this.handleSearch}>
              查询
            </Button>
            <Button className={styles.resetButton} onClick={this.resetQueryForm}>
              重置
            </Button>
          </Form>
        </div>

        {!listData || listData.length < 1 ? (
          // 空状态
          <div className={styles.emptyContainer}>
            <Empty className={styles.empty} />
          </div>
        ) : (
          // 习惯卡片
          <div className={styles.cardContainer}>
            {listData.map(item => (
              <div className={styles.cardItem} key={item.id}>
                <div className={styles.message}>
                  <div className={styles.nameContainer}>
                    <span className={styles.name}>{item.name}</span>
                    {this.renderTimeOfDay(item.time_of_days)}
                  </div>

                  <span className={styles.motto}>座右铭：{item.encourage}</span>

                  <div className={styles.userContainer}>
                    <span>发起人：</span>
                    {item.avatar ? <Avatar src={item.avatar} /> : <Avatar icon="user" />}
                    <span className={styles.username}>{item.account}</span>
                  </div>

                  <div className={styles.userContainer}>
                    <span>习惯状态：</span>
                    {this.renderLogStatus(item.status)}
                  </div>

                  <div className={classNames(styles.btnGroup, 'btnGroup2')}>
                    <Button
                      type="primary"
                      size="small"
                      className="encourageBtn"
                      onClick={() => this.showModal('0', item.id, item.user_id)}
                    >
                      鼓励
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      className="remindBtn"
                      onClick={() => this.showModal('1', item.id, item.user_id)}
                    >
                      提醒
                    </Button>
                  </div>
                  <Modal
                    title={title}
                    visible={visible}
                    okText="发送"
                    cancelText="取消"
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    maskStyle={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="一百字以内"
                      value={messageContent}
                      onChange={this.changeMessage}
                    />
                  </Modal>
                </div>

                <div className={styles.timeContainer}>
                  <div className={styles.time}>
                    <span className={styles.createdTime}>{moment(item.create_time).format('YYYY-MM-DD')}</span>
                  </div>
                  <span className={styles.frequency}>
                    {this.renderTodayIsNeedClock(item.status, item.type, item.frequency)}
                  </span>

                  <span className={styles.frequency}>{this.renderTodayIsClock(item.cstatus)}</span>

                  <div className={styles.dayContainer}>
                    <span className={styles.dayText}>已打卡的次数：</span>
                    <span className={styles.dayNumber}>{item.clock_count}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.pageinationContainer}>
              <Pagination current={pageNo} total={totalCount} pageSize={pageSize} onChange={this.onPageChange} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default AdminHabit;
