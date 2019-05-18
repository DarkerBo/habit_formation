/**
 * 表单验证
 * @param options 传一个数组,如下
 * [{ name: '账号', require: true, value: account, type: 'account', minLength: 4, maxLength: 15 },
    { name: '密码', require: true, value: password, type: 'password', minLength: 6 }, ]
 */
export default function(options) {
  const validateTypes = {
    phone: {
      regexp: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
      message: '手机号格式不正确',
    },

    number: {
      regexp: /^\d+(\.\d)+$/,
      message: '数字格式不正确',
    },

    posInteger: {
      regexp: /^[1-9]\d*$/,
      message: '正整数格式不正确',
    },

    score: {
      regexp: /^([0-4](\.[05])?|(5(\.0)?))$/,
      message: '分数格式不正确',
    },

    account: {
      regexp: /^[A-z0-9_]{4,15}$/,
      message: '账号由字母数字和下划线组成，4到15位',
    },

    password: {
      regexp: /^[A-z0-9_]{6,15}$/,
      message: '密码由字母数字和下划线组成，6到15位',
    },
  };

  const strategy = {
    required(name, value) {
      return !value ? `${name}不能为空` : '';
    },

    type(type, value) {
      return !validateTypes[type].regexp.test(value) ? validateTypes[type].message : '';
    },

    minLength(name, value, minLength) {
      return value.length < minLength ? `${name}长度最小为${minLength}` : '';
    },

    maxLength(name, value, maxLength) {
      return value.length > maxLength ? `${name}长度最大为${maxLength}` : '';
    },
  };

  for (const object of options) {
    const { name, value = '', require, type, minLength, maxLength } = object;

    const requiredMsg = require && strategy.required(name, value);
    const typeMsg = type && strategy.type(type, value);
    const minLengthMsg = minLength && strategy.minLength(name, value, minLength);
    const maxLengthMsg = maxLength && strategy.maxLength(name, value, maxLength);

    const msgArr = [requiredMsg, typeMsg, minLengthMsg, maxLengthMsg];

    for (const msg of msgArr) {
      if (msg) return msg;
    }
  }
}
