import axios from 'axios';

const _axios = axios.create({
  baseURL: 'http://127.0.0.1:7001',
  timeout: 5000,
});

_axios.interceptors.request.use(
  config => {
    // 获取绑定用户的uid,并将其绑定在地址栏上面
    const uid = window.localStorage.getItem('uid');
    const token = window.localStorage.getItem('token');
    config.headers.Authorization = `Bearer ${token}`;
    config.params = { ...config.params, uid };

    return config;
  },
  error => error
);

_axios.interceptors.response.use(
  response => response,
  error => {
    return error.response;
  }
);

export default _axios;
