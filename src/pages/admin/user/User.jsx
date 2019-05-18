import React, { Component } from 'react';
import styles from './User.module.scss';
import { Form, Input, Button, Table, Pagination, Select, Tag, message, Popconfirm } from 'antd';
import './User.scss';
import validateForm from '@/utils/form-validation';
import { getUserList, freezeOrThawUser } from '@/services/user';

class AdminUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: '', // 用户名
      status: '', // 用户状态
      tableData: [], // 表格数据
      pageNo: 1, // 第几页
      pageSize: 10, // 一页的数据数量
      totalCount: 0, // 数据总数
      saveCondition: {}, // 保存的查询条件
    };
  }

  componentDidMount() {
    this.getUserListInfo();
  }

  // 获取用户列表数据
  getUserListInfo = async () => {
    const { pageNo, pageSize, saveCondition } = this.state;

    const validateMessage = [{ name: '账号', value: saveCondition.account, maxLength: 15 }];
    const messageResult = validateForm(validateMessage);
    if (messageResult) return message.error(messageResult);

    const result = await getUserList({ ...saveCondition, pageNo, pageSize });
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
    const { account, status } = this.state;
    const saveCondition = { account, status };
    this.setState({
      saveCondition,
    });
  };

  // 分页页面改变事件
  onPageChange = async pageNo => {
    await this.setState({ pageNo });
    this.getUserListInfo();
  };

  // 点击查询语句
  handleSearch = async () => {
    await this.saveQueryCondition();
    this.getUserListInfo();
  };

  //重置查询表单
  resetQueryForm = async () => {
    await this.setState({
      account: '',
      status: '',
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

  // 冻结或解冻用户
  clickfreezeOrThawUser = async (id, status) => {
    const result = await freezeOrThawUser({ id, status: status === '0' ? '1' : '0' });
    if (result.data.code === '0') {
      message.success(status === '0' ? '冻结成功' : '解冻成功');
      this.handleSearch();
    } else {
      message.error(result.data.message);
    }
  };

  // 取消操作
  cancel = () => {
    message.info('已取消该操作');
  };

  render() {
    const { tableData, pageNo, pageSize, totalCount, account, status } = this.state;
    const columns = [
      {
        title: '用户ID',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
      },
      {
        title: '用户名',
        dataIndex: 'account',
        key: 'account',
        align: 'center',
      },
      {
        title: '用户昵称',
        dataIndex: 'nickname',
        key: 'nickname',
        align: 'center',
      },
      {
        title: '性别',
        dataIndex: 'sex',
        key: 'sex',
        align: 'center',
        render: text => {
          if (text === '0') {
            return <span>保密</span>;
          } else if (text === '1') {
            return <span>男</span>;
          } else {
            return <span>女</span>;
          }
        },
      },

      {
        title: '用户状态',
        key: 'status',
        dataIndex: 'status',
        align: 'center',
        render: text => (
          <span>
            <Tag color={text === '0' ? 'green' : 'red'}>{text === '0' ? '正常' : '冻结'}</Tag>
          </span>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        render: (text, record) => (
          <span>
            <Popconfirm
              title={`确定要${record.status === '0' ? '冻结' : '解冻'}该用户？`}
              onConfirm={() => this.clickfreezeOrThawUser(record.id, record.status)}
              onCancel={this.cancel}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" type="primary" className={record.status === '0' ? 'frozenBtn' : 'thawBtn'}>
                {record.status === '0' ? '冻结' : '解冻'}
              </Button>
            </Popconfirm>
          </span>
        ),
      },
    ];

    return (
      <div className={styles.container}>
        {/* 搜索栏 */}
        <div className={styles.manageContainer}>
          <Form className={styles.manageForm} layout="inline">
            <Form.Item label="用户名：" className={styles.manageFormItem}>
              <Input placeholder="username" value={account} onChange={this.changeAccount} />
            </Form.Item>
            <Form.Item label="用户状态：" className={styles.manageFormItem}>
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
                <Select.Option value="0">非冻结</Select.Option>
                <Select.Option value="1">冻结</Select.Option>
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
        {/* 用户资料表格 */}
        <div className={styles.tableContainer}>
          <div className={styles.tableTitle}>用户管理表格</div>
          <Table columns={columns} dataSource={tableData} pagination={false} />
          <div className={styles.pageinationContainer}>
            <Pagination current={pageNo} total={totalCount} pageSize={pageSize} onChange={this.onPageChange} />
          </div>
        </div>
      </div>
    );
  }
}

export default AdminUser;
