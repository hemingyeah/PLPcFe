import _ from 'lodash';
import MathUtil from '@src/util/math';
import { FORM_FIELD_TEXT_MAX_LENGTH, FORM_FIELD_TEXTAREA_MAX_LENGTH } from '@src/model/const/Number.ts';

// 单行最大长度
export const SINGLE_LINE_MAX_LEN = FORM_FIELD_TEXT_MAX_LENGTH;
// 多行最大长度
export const MULTI_LINE_MAX_LEN = FORM_FIELD_TEXTAREA_MAX_LENGTH;
// 电话
export const TEL_REG = /^(((0\d{2,3}-{0,1})?\d{7,8})|(\d{6}))$/;
// 手机号
export const PHONE_REG = /^((1[3578496]\d{9})|([+][0-9-]{1,30}))$/;
// 日期格式
export const DATE_REG = /^\d{4}-\d{1,2}-\d{1,2}$/;
// 日期时间格式
export const DATETIME_REG = /^\d{4}-\d{1,2}-\d{1,2}\s\d{2}:\d{2}:\d{2}$/;
// 邮箱格式
export const EMAIL_REG = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
// 链接格式
export const LINK_REG = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;


const RuleMap = {
  text,
  select,
  textarea,
  code: text,
  number,
  date,
  datetime,
  phone,
  email,
  user,
  attachment,
  address,
  link,
  customer: select,
  sparepart: select,
  serviceIterm: select,
  planTime
};

/** 单行文本验证，50字以内 */
function text(value, field = {}){
  return new Promise((resolve, reject) => {
    // 先验证长度
    if(value != null && value.toString().length > SINGLE_LINE_MAX_LEN){
      return resolve(`长度不能超过${SINGLE_LINE_MAX_LEN}个字符`);
    }
    // 允许为空则不继续验证
    if(field.isNull) return resolve(null);
    // 不允许为空
    if(!value || value.toString().length == 0) return resolve(`请输入${field.displayName}`);
    resolve(null);
  })
}

/** 单选必选验证 */
function select(value, field = {}) {
  return new Promise((resolve, reject) => {
    if (field.isNull) return resolve(null);
    if (value == null || !value.toString().length) return resolve(`请选择${field.displayName}`);
    resolve(null);
  })
}

/** 多行文本验证，500字以内 */
function textarea(value, field = {}) {
  return new Promise((resolve, reject) => {
    if (value !== null && value.toString().length > MULTI_LINE_MAX_LEN) {
      return resolve(`长度不能超过${MULTI_LINE_MAX_LEN}个字符`);
    }
    if (field.isNull === 1) return resolve(null);
    if (value == null || value.toString().length == 0) return resolve(`请输入${field.displayName}`);
    resolve(null);
  });
}

// 验证电话手机格式
function phone(value, field = {}) {
  return new Promise(resolve => {
    if(field.isNull && !value) return resolve(null);
    if(value == null || !value.toString().length) return resolve(`请输入${field.displayName}`);
    if (![TEL_REG, PHONE_REG].some(reg => reg.test(value))) return resolve('请输入正确的电话或者手机号');
    resolve(null);
  });
}

function email(value, field = {}) {
  return new Promise(resolve => {
    if(field.isNull && !value) return resolve(null);
    if(value == null || !value.toString().length) return resolve(`请输入${field.displayName}`);
    if (!EMAIL_REG.test(value)) return resolve('请输入正确的邮箱');
    resolve(null);
  });
}

function date(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve(`请选择${field.displayName}`);
    if (!DATE_REG.test(value)) return resolve('请输入正确格式的日期');
    resolve(null);
  });
}

function datetime(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve(`请选择${field.displayName}`);
    if (!DATETIME_REG.test(value)) return resolve('请输入正确格式的日期');
    resolve(null);
  });
}

function planTime(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve(`请选择${field.displayName}`);
    let REG = field.setting.dateType == 'date' ? DATE_REG : DATETIME_REG;
    if (!REG.test(value)) return resolve('请输入正确格式的日期');
    resolve(null);
  });
}

function number(value, field = {}) {
  let { decimalConfig, limitConig } = field.setting;

  return new Promise(resolve => {
    // 校验小数位数
    if (typeof decimalConfig == 'object') {
      let { digit, isLimit } = decimalConfig;
      let decimal = MathUtil.decimalNumber(value);

      if (isLimit == 1 && digit != '' && decimal > Number(digit)) return resolve(`仅允许输入${digit}位小数`);
    }

    // 校验数值范围
    if (typeof limitConig == 'object') {
      let { isLimit, type, max, min } = limitConig;

      if (isLimit == 1) {
        // 自定义范围
        if (type == 1 && (max || min)) {
          if (min && !max && Number(value) < Number(min)) return resolve(`输入的值必须>=${min}`);
          if (!min && max && Number(value) > Number(max)) return resolve(`输入的值必须<=${max}`);
          if (min && max && (Number(value) > Number(max) || Number(value) < Number(min))) return resolve(`输入的值必须>=${min}且<=${max}`);
        }
      }
    }

    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve(`请输入${field.displayName}`);
    if (typeof Number(value) !== 'number') return resolve('请输入数字');
    resolve(null);
  });
}

function attachment(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve(`请上传${field.displayName}`);
    resolve(null);
  });
}

function user(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || Object.keys(value).length == 0) return resolve(`请选择${field.displayName}`);
    resolve(null);
  });
}

function address(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull) return resolve(null);
    if (!value || !value.toString().length) return resolve(`请补全${field.displayName}`);
    
    
    const {province, city, address} = value;
  
    if (!province || !city || !address) {
      return resolve('必填');
    }
    if (address.length > SINGLE_LINE_MAX_LEN) return resolve(`详细地址长度不能超过${SINGLE_LINE_MAX_LEN}个字符`);
  
    resolve(null);
  });
}

function link(value, field = {}) {
  return new Promise(resolve => {
    if(field.isNull && !value.link) return resolve(null);
    if(value == null || !value.toString().length) return resolve(`请输入${field.displayName}`);
    if (!LINK_REG.test(value.link)) return resolve('请输入正确的链接');
    // if (!/^https?/g.test(value)) return resolve('超链接请以http://或者https://开头');
  
    resolve(null);
  });
}

function customer(value, field = {}) {
  return new Promise((resolve, reject) => {
    // 先验证长度
    if(value != null && value.toString().length > SINGLE_LINE_MAX_LEN){
      return resolve(`长度不能超过${SINGLE_LINE_MAX_LEN}个字符`);
    }
    // 允许为空则不继续验证
    if(field.isNull) return resolve(null);
    // 不允许为空
    if(!value || value.toString().length == 0) return resolve(`请输入${field.displayName}`);
    resolve(null);
  })
}

function extend(value, field = {}) {
  return new Promise((resolve, reject) => {
    // 允许为空则不继续验证
    if(field.isNull) return resolve(null);
    // 不允许为空
    if(!value || value.toString().length == 0) return resolve(`请选择${field.displayName}`);
    resolve(null);
  })
} 

/**
 * 根据字段类型验证值
 * @param {*} value 值
 * @param {*} formType 字段类型 
 * @returns Promise<message> 
 */
function validate(value, field){
  let fn = RuleMap[field.formType];
  if(typeof fn == 'function') return fn(value, field);

  return Promise.resolve(null)
}

/** 
 * 创建远程验证方法
 * @param {function} api - 调用的api方法
 * @param {function} build - 参数构建方法
 * @param {number} delay - 延时, 默认500ms延时
 */
export function createRemoteValidate(api, build, delay = 500){
  let invoke = _.debounce(function(params, resolve, changeStatus){
    changeStatus(true);
    return api(params).then(res => {
      changeStatus(false);
      return resolve(res.error ? res.error : null);
    })
      .catch(err => console.error(err))
  }, delay);

  return function(value, field, changeStatus){
    let params = typeof build == 'function' ? build(value, field) : {};
    return new Promise(resolve => invoke(params, resolve, changeStatus))
  }
}

const Validator = {
  validate,
  createRemoteValidate
};

export default Validator;
