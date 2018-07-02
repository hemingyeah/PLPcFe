import DateUtil from './date'

/** 判读给定的值是否是空串 */
export function isEmptyStr(value){
  return typeof value == 'string' && value.length == 0;
}

/** 判断给定值是否为安全的数值 */
export function isSafeNumber(value){
  return typeof(value) == 'number' && !isNaN(value) && isFinite(value);
}

/** 格式化时间 */
export function formatDate(date, tmp){
  return DateUtil.format(date, tmp);
}

/** 解析时间 */
export function parseDate(str, tmp){
  return DateUtil.parse(str, tmp);
}