import * as types from '../action-type';

const initUserState = {
  userLogin: false,
  adminLogin: false,
  userInfo: null,
};

// 获取登陆状态和用户信息
export function user(state = initUserState, action) {
  const { payload } = action;
  switch (action.type) {
    case types.CHANGE_USER_LOGIN_STATUS:
      return {
        ...state,
        userLogin: payload,
      };
    case types.CHANGE_ADMIN_LOGIN_STATUS:
      return {
        ...state,
        adminLogin: payload,
      };

    case types.SAVE_USERINFO:
      return {
        ...state,
        userInfo: payload,
      };

    default:
      return state;
  }
}
