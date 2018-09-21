import http from '@src/util/http';

//单行最大长度
export const SINGLE_LINE_MAX_LEN = 50;
//多行最大长度
export const MULTI_LINE_MAX_LEN = 500;
//电话或者手机号
export const PHONE_REG = /^(((0\d{2,3}-{0,1})?\d{7,8})|(1[3578496]\d{9})|([+][0-9-]{1,30}))$/;
//日期格式
export const DATE_REG = /^\d{4}-\d{1,2}-\d{1,2}$/;
//日期时间格式
export const DATETIME_REG = /^\d{4}-\d{1,2}-\d{1,2}\s\d{2}:\d{2}:\d{2}$/;

const RuleMap = {
  text,
  select,
  textarea,
  code: text,
  number,
  date,
  datetime,
  phone,
  user,
  attachment,
  address,
};

/** 单行文本验证，50字以内 */
 function text(value, field = {}){
  return new Promise((resolve, reject) => {
    //先验证长度
    if(value != null && value.toString().length > SINGLE_LINE_MAX_LEN){
      return resolve(`长度不能超过${SINGLE_LINE_MAX_LEN}个字符`);
    }
    //允许为空则不继续验证
    if(field.isNull) return resolve(null);
    //不允许为空
    if(!value || !value.toString().length) return resolve(`必填`);
    if (field.remoteValidation) return resolve(remoteValidation(value, field));
    resolve(null);
  })
}

/** 远程验证 */
function remoteValidation(value, field = {}) {
  const { action, buildParams, } = field.remoteValidation;
  let params = buildParams();
  params.value = value;
  return http.post(action, params, false);
}

/** 单选必选验证 */
function select(value, field = {}) {
  return new Promise((resolve, reject) => {
    if (field.isNull) return resolve(null);
    if (value == null || !value.toString().length) return resolve('必选');
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
    if (value == null || !value.toString().length) return resolve('必填');
    resolve(null);
  });
}

// 验证电话手机格式
function phone(value, field = {}) {
  return new Promise(resolve => {
    if(field.isNull) return resolve(null);
    if(value == null || !value.toString().length) return resolve(`必填`);
    if (!PHONE_REG.test(value)) return resolve('请输入正确的电话或者手机号');
    resolve(null);
  });
}

function date(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve('必填');
    if (!DATE_REG.test(value)) return resolve('请输入正确格式的日期');
    resolve(null);
  });
}

function datetime(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve('必填');
    if (!DATETIME_REG.test(value)) return resolve('请输入正确格式的日期');
    resolve(null);
  });
}

function number(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve('必填');
    if (typeof Number(value) !== 'number') return resolve('请输入数字');
    resolve(null);
  });
}

function attachment(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve('必须上传附件');
    resolve(null);
  });
}

function user(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve('必选');
    resolve(null);
  });
}

function address(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull) return resolve(null);
    if (!value || !value.toString().length) return resolve('必选');
    const {adProvince, adCity, adAddress, } = value;
    if (!adProvince || !adCity || !adAddress) {
      return resolve('必填');
    }
    resolve(null);
  });
}

function validateRequired(value, field = {}) {
  return new Promise(resolve => {
    if (field.isNull === 1) return resolve(null);
    if (!value || !value.toString().length) return resolve('必填');
    resolve(null);
  });
}

/**
 * 根据字段类型验证值
 * @param {*} value 值
 * @param {*} formType 字段类型 
 * @param {*} options 可选项
 */
function validate(value, field){
  let fn = RuleMap[field.formType];
  return typeof fn == 'function' ? fn(value, field) : Promise.resolve(null);
}

const Validator = {validate};

export default Validator;
