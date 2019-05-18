import axios from './config';

// 创建日志接口
export const createLog = async params => {
  return await axios.post('/log/createLog', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 获取日志信息接口
export const getLogInfo = async params => {
  return await axios.get('/log/getLogInfo', { params });
};

// 获取日志信息列表接口
export const getLogList = async params => {
  return await axios.get('/log/getLogList', { params });
};

// 获取日志信息详情接口
export const getLogDetail = async params => {
  return await axios.get('/log/getLogDetail', { params });
};

// 删除日志接口
export const deleteLog = async params => {
  return await axios.post('/log/deleteLog', params);
};

// 改变日志置顶状态接口
export const changeLogTopping = async params => {
  return await axios.post('/log/changeLogTopping', params);
};

// 改变日志密码状态接口
export const changeLogPrivate = async params => {
  return await axios.post('/log/changeLogPrivate', params);
};

// 创建日志评论接口
export const createLogComment = async params => {
  return await axios.post('/log/createLogComment', params);
};

// 获取日志评论信息列表接口
export const getLogCommentList = async params => {
  return await axios.get('/log/getLogCommentList', { params });
};

// 改变日志评论置顶状态接口
export const changeLogCommentStatus = async params => {
  return await axios.post('/log/changeLogCommentStatus', params);
};

// 根据排序方式获取日志评论信息列表接口
export const getLogCommentBySort = async params => {
  return await axios.get('/log/getLogCommentBySort', { params });
};

// 删除日志评论接口
export const deleteLogComment = async params => {
  return await axios.post('/log/deleteLogComment', params);
};

// 创建日志点赞接口
export const createLogLike = async params => {
  return await axios.post('/log/createLogLike', params);
};

// 获取日志点赞列表接口
export const getLogLikeList = async params => {
  return await axios.get('/log/getLogLikeList', { params });
};

// 删除日志点赞接口
export const deleteLogLike = async params => {
  return await axios.post('/log/deleteLogLike', params);
};
