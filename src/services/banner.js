import axios from './config';

// 创建或修改公告图接口
export const createOrEditBanner = async params => {
  return await axios.post('/banner/createOrEditBanner', params);
};

// 获取公告图信息接口
export const getBannerInfo = async params => {
  return await axios.get('/banner/getBannerInfo', { params });
};
