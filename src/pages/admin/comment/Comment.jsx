import React, { Component } from 'react';
import styles from './Comment.module.scss';
import './Common.scss';
import { Form, Input, Select, Button, Table, Pagination, message, Tag, Divider, Popover, Popconfirm } from 'antd';
import validateForm from '@/utils/form-validation';
import { getLogCommentList, deleteLogComment, changeLogCommentStatus } from '@/services/log';
import classNames from 'classnames';

class AdminComment extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '', // 用户名
      logId: '', // 日志ID
      status: '', // 日志评论状态
      tableData: [], // 表格数据
      pageNo: 1, // 第几页
      pageSize: 3, // 一页的数据数量
      totalCount: 0, // 数据总数
      saveCondition: {}, // 保存的查询条件
    };
  }

  componentDidMount() {
    this.getLogCommentListInfo();
  }

  // 获取日志列表
  getLogCommentListInfo = async () => {
    const { pageNo, pageSize, saveCondition } = this.state;

    const validateMessage = [{ name: '昵称', value: saveCondition.account, maxLength: 15 }];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return message.error(messageResult);

    const result = await getLogCommentList({ ...saveCondition, pageNo, pageSize });
    if (result.data.code === '0') {
      const tableData = result.data.data.result;

      for (const item of tableData) {
        item.key = item.id;
      }

      this.setState({
        tableData,
        totalCount: result.data.data.totalCount,
      });
    } else {
      message.error(result.data.message);
    }
  };

  // 保存查询条件
  saveQueryCondition = () => {
    const { account, status, logId } = this.state;
    const saveCondition = { account, status, log_id: Number(logId) === 0 ? '' : Number(logId) };
    this.setState({
      saveCondition,
    });
  };

  // 分页页面改变事件
  onPageChange = async pageNo => {
    await this.setState({ pageNo });
    this.getLogCommentListInfo();
  };

  // 点击查询语句
  handleSearch = async () => {
    await this.saveQueryCondition();
    this.getLogCommentListInfo();
  };

  //重置查询表单
  resetQueryForm = async () => {
    await this.setState({
      account: '',
      status: '',
      logId: '',
      pageNo: 1,
    });
    this.handleSearch();
  };

  // 改变下拉框的值事件
  handleChange = value => {
    this.setState({
      status: value,
    });
  };

  // 用户名输入框事件
  changeAccount = e => {
    this.setState({
      account: e.target.value,
    });
  };

  // 改变日志ID输入框值事件
  changeLogId = e => {
    this.setState({
      logId: e.target.value,
    });
  };

  // 确认框点击确认按钮事件
  handleConfirm = async (id, log_id) => {
    const result = await deleteLogComment({ id, log_id });
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

  // 改变评论状态事件
  changeCommentStatus = async (id, status) => {
    const result = await changeLogCommentStatus({ id, status: status === '0' ? '1' : '0' });
    if (result.data.code === '0') {
      message.success(`已${status === '0' ? '置顶' : '取消置顶'}该日志评论`);
      this.handleSearch();
    } else {
      message.error(result.data.message);
    }
  };

  render() {
    const { tableData, pageNo, pageSize, totalCount, account, status, logId } = this.state;

    const columns = [
      {
        title: '评论ID',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
      },
      {
        title: '评论内容',
        dataIndex: 'content',
        key: 'content',
        align: 'center',
        render: text => (
          <Popover content={<div>{text}</div>} title="评论详情" placement="right" className="popoverContainer">
            <div className={styles.tableContent}>{text}</div>
          </Popover>
        ),
      },
      {
        title: '用户名',
        dataIndex: 'account',
        key: 'account',
        align: 'center',
      },
      {
        title: '日志ID',
        dataIndex: 'log_id',
        key: 'log_id',
        align: 'center',
      },

      {
        title: '评论状态',
        key: 'status',
        dataIndex: 'status',
        align: 'center',
        render: text => (
          <span>
            <Tag color={text === '0' ? 'geekblue' : 'green'}>{text === '0' ? '正常' : '置顶'}</Tag>
          </span>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <span>
            <Button
              size="small"
              type="danger"
              className={record.status === '0' ? 'toppingBtn' : 'untoppingBtn'}
              onClick={() => this.changeCommentStatus(record.id, record.status)}
            >
              {record.status === '0' ? '置顶' : '撤下'}
            </Button>
            <Divider type="vertical" />

            <Popconfirm
              title="确定删除该日志评论吗?"
              onConfirm={() => this.handleConfirm(record.id, record.log_id)}
              onCancel={this.handleCancel}
              okText="确定"
              cancelText="取消"
            >
              <Button type="danger" size="small">
                删除
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ];

    return (
      <div className={classNames(styles.container, 'commentContainer')}>
        {/* 搜索栏 */}
        <div className={styles.manageContainer}>
          <Form className={styles.manageForm} layout="inline">
            <Form.Item label="用户名：" className={styles.manageFormItem}>
              <Input placeholder="username" value={account} onChange={this.changeAccount} />
            </Form.Item>
            <Form.Item label="日志ID：" className={styles.manageFormItem}>
              <Input placeholder="log id" value={logId} onChange={this.changeLogId} />
            </Form.Item>
            <Form.Item label="评论状态：" className={styles.manageFormItem}>
              <Select
                showSearch
                style={{ width: 180 }}
                placeholder="Select a status"
                optionFilterProp="children"
                onChange={this.handleChange}
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                value={status}
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

        {/* 评论信息表格 */}
        <div className={styles.tableContainer}>
          <div className={styles.tableTitle}>日志评论管理表格</div>
          <Table columns={columns} dataSource={tableData} pagination={false} className={styles.table} />
          <div className={styles.pageinationContainer}>
            <Pagination current={pageNo} total={totalCount} pageSize={pageSize} onChange={this.onPageChange} />
          </div>
        </div>
      </div>
    );
  }
}

export default AdminComment;
