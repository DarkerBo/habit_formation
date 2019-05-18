import * as types from '../action-type';

const initNavConfigState = {
  menuSelectKey: ['0'],
  tabBarSelectKey: 'Today',
};

// 前后台导航栏的选项
export function nav(state = initNavConfigState, action) {
  switch (action.type) {
    case types.CHANGE_MENU_KEY:
      return { ...state, menuSelectKey: action.payload };
    case types.CHANGE_TABBAR_KEY:
      return { ...state, tabBarSelectKey: action.payload };
    default:
      return state;
  }
}
