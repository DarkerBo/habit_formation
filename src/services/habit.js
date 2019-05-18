import axios from './config';

// 习惯创建或修改接口
export const createOrEditHabit = async params => {
  return await axios.post('/habit/createOrEditHabit', params);
};

// 获取用户习惯信息接口
export const getHabitInfo = async params => {
  return await axios.get('/habit/getHabitInfo', { params });
};

// 获取习惯详情接口
export const getHabitDetail = async params => {
  return await axios.get('/habit/getHabitDetail', { params });
};

// 获取习惯列表接口
export const getHabitList = async params => {
  return await axios.get('/habit/getHabitList', { params });
};

// 删除习惯接口
export const deleteHabit = async params => {
  return await axios.post('/habit/deleteHabit', params);
};

// 根据打卡记录改变习惯的状态接口
export const changeUserHabitStatus = async params => {
  return await axios.post('/habit/changeUserHabitStatus', params);
};

// 增加习惯的监督人
export const addSuperintendent = async params => {
  return await axios.post('/habit/addSuperintendent', params);
};
