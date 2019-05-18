import * as types from '../action-type';
import { getUserInfo } from '@/services/user';

// 改变用户登陆的状态
export const changeUserLoginStatus = payload => ({
  type: types.CHANGE_USER_LOGIN_STATUS,
  payload,
});

// 改变管理员登陆的状态
export const changeAdminLoginStatus = payload => ({
  type: types.CHANGE_ADMIN_LOGIN_STATUS,
  payload,
});

// 改变用户或管理员登陆的状态
export const getUserInfoAction = () => {
  return async dispatch => {
    const userInfo = await getUserInfo();
    if (userInfo.data.code === '0') {
      const type = userInfo.data.data.type;
      dispatch({
        type: type === '0' ? types.CHANGE_USER_LOGIN_STATUS : types.CHANGE_ADMIN_LOGIN_STATUS,
        payload: true,
      });
      // 如果有用户信息，将它存到redux的userInfo中
      dispatch({
        type: types.SAVE_USERINFO,
        payload: userInfo.data.data,
      });
    }
    dispatch({
      type: types.CHANGE_HAS_PULL_DATA_STATUS,
      payload: true,
    });
  };
};

// 存储用户或管理员的信息
export const saveUserInfoAction = () => {
  return async dispatch => {
    const userInfo = await getUserInfo();
    dispatch({
      type: types.SAVE_USERINFO,
      payload: userInfo.data.data,
    });
  };
};
