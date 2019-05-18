import * as types from '../action-type';

const initConfigState = {
  hasPullData: false, // 是否已经获取数据，可以渲染组件了
};

// 全局配置reducer
export function config(state = initConfigState, action) {
  switch (action.type) {
    case types.CHANGE_HAS_PULL_DATA_STATUS:
      return { ...state, hasPullData: action.payload };
    default:
      return state;
  }
}
