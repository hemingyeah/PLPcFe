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
//邮箱格式
export const EMAIL_REG = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;

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
    if(field.isNull) return resolve(null);
    if(value == null || !value.toString().length) return resolve(`请输入${field.displayName}`);
    if(!PHONE_REG.test(value)) return resolve('请输入正确的电话或者手机号');
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

function number(value, field = {}) {
  return new Promise(resolve => {
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
    if (!value || !value.toString().length) return resolve(`请选择${field.displayName}`);
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

/** 远程验证 */
function remoteValidation(value, remote) {
  const { 
    action, 
    buildParams, 
    method = 'get', 
    emulateJSON = false,
    isCancelable,
  } = remote;
  let params = buildParams(value);
  const options = {
    cancelable: isCancelable ? isCancelable() : false,
  };
  let fn = http[method];
  let args = [action, params, emulateJSON, options];
  if(method == 'get') args.splice(2, 1,);

  return fn.apply(http, args);
}

/**
 * 根据字段类型验证值
 * @param {*} value 值
 * @param {*} formType 字段类型 
 * @param {*} options 可选项
 */
async function validate(value, field, options = {}){
  let fn = RuleMap[field.formType];
  let message = null;
  if(typeof fn == 'function') message = await fn(value, field);
  //如果有远程验证
  if(message == null && options.remote) {
    let changeRemoteStatus = options.changeRemoteStatus;
    changeRemoteStatus(true);

    let result = await remoteValidation(value, options.remote);
    message = result.error ? result.error : null;

    changeRemoteStatus(false);
  }
  return message;
}

const Validator = {validate};

export default Validator;
