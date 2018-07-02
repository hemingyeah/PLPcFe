import * as Lang from './lang';

/**
 * 将字符串解析成对象，主要用于url参数的解析
 * @example  a=1&b=1&b=2 => {a:1, b: [1,2]}
 * @author dongls
 * 
 * @param {string} str 待解析的字符串
 * @returns {object} 解析后的对象
 */
export function parse(str){
  if(typeof str != 'string' || Lang.isEmptyStr(str.trim())) return {};
  if(str.indexOf("?") == 0) str = str.substring(1);

  let model = {};
  let params = str.split("&");

  params.forEach(param => {
    let [key, value] = param.split("=");
    value = convertValue(value);

    if(model.hasOwnProperty(key)){
      let modelValue = model[key];
      if(Array.isArray(modelValue)){
        modelValue.push(value)
      }else{
        let arr = [modelValue, value];
        model[key] = arr;
      }
    }else{
      model[key] = value;
    }
  })

  return model;
}

function convertValue(value){
  value = decodeURIComponent(value);
  if(value == null || Lang.isEmptyStr(value)) return value;
  //boolean值判断
  if(value == 'true' || value == 'false') return value == 'true';
  //判断是否为数字
  if(Number(value) == value) return Number(value);

  return value;
}

/**
 * 将一个对象序列化成字符串，主要用于表单提交、url拼接
 * 
 * 注意以下情况：
 *  1. 不会转换对象原型链上的属性
 *  2. 不支持套嵌对象, 如有需要建议以JSON形式提交
 * 
 * @example {a:1, b: [1,2]} => a=1&b=1&b=2
 * @author dongls
 * 
 * @param {object} model 待序列化的对象
 * @returns {string} 序列化后的字符串
 */
export function stringify(model){
  if(typeof model != 'object' || (typeof model == 'object' && Object.keys(model) == 0)) return '';

  let params = [];
  Object.keys(model).forEach(key => {
    let value = model[key];

    if(Array.isArray(value)){
      value.forEach(item => params.push(`${key}=${encodeURIComponent(item)}`))
    }else{
      params.push(`${key}=${encodeURIComponent(value)}`)
    }
  })

  return params.join("&");
}
