import * as types from '../action-type';

// 改变后台管理导航栏Menu的selectKey
export const changeMenuKey = payload => ({ type: types.CHANGE_MENU_KEY, payload });

// 改变前台导航栏TabBar的selectKey
export const changeTabBarKey = payload => ({ type: types.CHANGE_TABBAR_KEY, payload });
