import React, { Component } from 'react';
import styles from './Square.module.scss';
import {
  Form,
  Input,
  Button,
  Select,
  List,
  Avatar,
  Icon,
  Pagination,
  Switch,
  Popconfirm,
  message,
  Empty,
  Modal,
} from 'antd';
import validateForm from '@/utils/form-validation';
import { getLogList, changeLogTopping, deleteLog } from '@/services/log';

class AdminSquare extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickname: '', // 用户昵称
      logId: '', // 日志ID
      topping: '', // 日志状态
      listData: [], // 列表数据
      pageNo: 1, // 第几页
      pageSize: 3, // 一页的数据数量
      totalCount: 0, // 数据总数
      saveCondition: {}, // 保存的查询条件
      visible: false, //是否显示模态框
      image: '', // 日志图片地址
    };
  }

  componentDidMount() {
    this.getLogListInfo();
  }

  // 获取日志列表
  getLogListInfo = async () => {
    const { pageNo, pageSize, saveCondition } = this.state;

    const validateMessage = [{ name: '昵称', value: saveCondition.nickname, maxLength: 15 }];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return message.error(messageResult);

    const result = await getLogList({ ...saveCondition, pageNo, pageSize });
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

  // 改变选择框事件
  handleChange = value => {
    this.setState({
      topping: value,
    });
  };

  onSwitchChange = async (checked, id) => {
    const req = { id, topping: checked ? '1' : '0' };
    const result = await changeLogTopping(req);
    if (result.data.code === '0') {
      message.success(`已${checked ? '置顶' : '撤销置顶'}该日志`);
      this.handleSearch();
    } else {
      message.error(result.data.message);
    }
  };

  // 保存查询条件
  saveQueryCondition = () => {
    const { nickname, topping, logId } = this.state;
    const saveCondition = { nickname, topping, id: Number(logId) === 0 ? '' : Number(logId) };
    this.setState({
      saveCondition,
    });
  };

  // 点击查询语句
  handleSearch = async () => {
    await this.saveQueryCondition();
    this.getLogListInfo();
  };

  //重置查询表单
  resetQueryForm = async () => {
    await this.setState({
      nickname: '',
      topping: '',
      logId: '',
      pageNo: 1,
    });
    this.handleSearch();
  };

  // 确认框点击确认按钮事件
  handleConfirm = async id => {
    const result = await deleteLog({ id });
    if (result.data.code === '0') {
      message.success('已成功执行删除操作');
      this.handleSearch();
    } else {
      message.error(result.data.message);
    }
  };

  // 确认框点击取消按钮事件
  handleCancel = () => {
    message.info('已取消删除操作');
  };

  // 分页页面改变事件
  onPageChange = async pageNo => {
    await this.setState({ pageNo });
    this.getLogListInfo();
  };

  // 改变昵称输入框值事件
  changeNickname = e => {
    this.setState({
      nickname: e.target.value,
    });
  };

  // 改变日志ID输入框值事件
  changeLogId = e => {
    this.setState({
      logId: e.target.value,
    });
  };

  // 关闭模态框
  cancelModal = () => {
    this.setState({
      visible: false,
    });
  };

  // 点击图片事件
  clickImage = image => {
    this.setState({
      visible: true,
      image,
    });
  };

  render() {
    const { listData, pageNo, pageSize, totalCount, nickname, topping, logId, visible, image } = this.state;
    return (
      <div className={styles.container}>
        {/* 搜索栏 */}
        <div className={styles.manageContainer}>
          <Form className={styles.manageForm} layout="inline">
            <Form.Item label="用户昵称：" className={styles.manageFormItem}>
              <Input placeholder="nickname" value={nickname} onChange={this.changeNickname} />
            </Form.Item>
            <Form.Item label="日志ID：" className={styles.manageFormItem}>
              <Input placeholder="log id" value={logId} onChange={this.changeLogId} />
            </Form.Item>
            <Form.Item label="日志状态：" className={styles.manageFormItem}>
              <Select
                showSearch
                style={{ width: 180 }}
                placeholder="Select a status"
                optionFilterProp="children"
                onChange={this.handleChange}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                value={topping}
              >
                <Select.Option value="">所有状态</Select.Option>
                <Select.Option value="0">非置顶</Select.Option>
                <Select.Option value="1">置顶</Select.Option>
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
        {/* 日志数据列表 */}
        {listData.length > 0 ? (
          <div className={styles.squareList}>
            <List
              itemLayout="vertical"
              size="large"
              dataSource={listData}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  actions={[
                    <span>
                      <Icon type="like-o" />
                      &nbsp;{item.like_count}
                    </span>,
                    <span>
                      <Icon type="message" />
                      &nbsp;{item.comment_count}
                    </span>,
                    <span>日志ID： {item.id}</span>,
                  ]}
                  extra={
                    <div className={styles.imgContainer}>
                      <div className={styles.logManage}>
                        置顶：
                        <Switch
                          checked={item.topping === '1'}
                          onChange={checked => this.onSwitchChange(checked, item.id)}
                        />
                        <Popconfirm
                          title="确定删除该日志吗?"
                          onConfirm={() => this.handleConfirm(item.id)}
                          onCancel={this.handleCancel}
                          okText="确定"
                          cancelText="取消"
                        >
                          <Button type="danger" size="small" className={styles.deleteButton}>
                            删除
                          </Button>
                        </Popconfirm>
                      </div>
                      {item.picture && (
                        <div className={styles.imgWall}>
                          {item.picture.split(',').map((image, index) => (
                            <img
                              className={styles.image}
                              alt="日志图片"
                              src={image}
                              key={index}
                              onClick={() => this.clickImage(image)}
                            />
                          ))}
                          <Modal
                            title="日志图片"
                            visible={visible}
                            footer={null}
                            onCancel={this.cancelModal}
                            style={{ textAlign: 'center' }}
                          >
                            <img src={image} alt="日志图片" className={styles.logImage} />
                          </Modal>
                        </div>
                      )}
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={item.avatar ? <Avatar src={item.avatar} /> : <Avatar icon="user" />}
                    title={<span>{item.nickname}</span>}
                    description={`该用户已打卡${item.name}习惯`}
                  />
                  {item.content}
                </List.Item>
              )}
            />
            <div className={styles.pageinationContainer}>
              <Pagination current={pageNo} total={totalCount} pageSize={pageSize} onChange={this.onPageChange} />
            </div>
          </div>
        ) : (
          <div className={styles.emptyContainer}>
            <Empty className={styles.empty} />
          </div>
        )}
      </div>
    );
  }
}

export default AdminSquare;
