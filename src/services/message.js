import axios from './config';

// 创建或修改消息接口
export const createOrEditMessage = async params => {
  return await axios.post('/message/createOrEditMessage', params);
};

// 获取用户消息接口
export const getMessageInfo = async params => {
  return await axios.get('/message/getMessageInfo', { params });
};

// 获取系统通知接口
export const getSystemMessageInfo = async params => {
  return await axios.get('/message/getSystemMessageInfo', { params });
};

// 获取消息详情接口
export const getMessageDetail = async params => {
  return await axios.get('/message/getMessageDetail', { params });
};

// 修改消息接口
export const modifyMessageInfo = async params => {
  return await axios.post('/message/modifyMessageInfo', params);
};

// 删除用户消息接口
export const deleteMessage = async params => {
  return await axios.post('/message/deleteMessage', params);
};

// 修改消息状态为已读或未读接口
export const changeMessageRead = async params => {
  return await axios.post('/message/changeMessageRead', params);
};

// 创建二级消息接口
export const createMessageDetail = async params => {
  return await axios.post('/message/createMessageDetail', params);
};

// 获取接受到的二级消息接口
export const getMessageDetailInfo = async params => {
  return await axios.get('/message/getMessageDetailInfo', { params });
};

// 获取接受到的二级消息列表接口
export const getMessageDetailList = async params => {
  return await axios.get('/message/getMessageDetailList', { params });
};
