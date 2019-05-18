import axios from './config';

// 用户登陆接口
export const login = async params => {
  return await axios.post('/user/login', params);
};

// 用户注册接口
export const register = async params => {
  return await axios.post('/user/register', params);
};

// 获取用户信息接口
export const getUserInfo = async params => {
  return await axios.get('/user/getUserInfo', { params });
};

// 获取用户列表接口
export const getUserList = async params => {
  return await axios.get('/user/getUserList', { params });
};

// 修改用户信息接口
export const modifyUserInfo = async params => {
  return await axios.post('/user/modifyUserInfo', params, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 修改用户密码接口
export const modifyPassword = async params => {
  return await axios.post('/user/modifyPassword', params);
};

// 验证监督人昵称是否合法
export const getNicknameLegal = async params => {
  return await axios.get('/user/getNicknameLegal', { params });
};

// 冻结或解冻用户
export const freezeOrThawUser = async params => {
  return await axios.post('/user/freezeOrThawUser', params);
};
