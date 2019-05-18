import axios from './config';

// 打卡记录创建或修改接口
export const createOrEditClock = async params => {
  return await axios.post('/clock/createOrEditClock', params);
};

// 获取用户打卡记录信息接口
export const getClockInfo = async params => {
  return await axios.get('/clock/getClockInfo', { params });
};

// 获取打卡记录信息接口
export const getClockList = async params => {
  return await axios.get('/clock/getClockList', { params });
};

// 获取今天打卡记录
export const getTodayIsClock = async params => {
  return await axios.get('/clock/getTodayIsClock', { params });
};

// 获取今天打卡记录列表
export const getTodayIsClockList = async params => {
  return await axios.get('/clock/getTodayIsClockList', { params });
};
