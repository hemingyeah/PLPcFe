export * from './string'

import DateUtil from './date';

const MAX_SAFE_INTEGER = 9007199254740991;

/** 判读给定的值是否是空串 */
export function isEmptyStr(value) {
  return typeof value == 'string' && value.trim().length == 0;
}

/** 判断是否为空值 */
export function isEmpty(value) {
  return null == value || isEmptyStr(value);
}

/** 判断给定值是否为安全的数值 */
export function isSafeNumber(value) {
  return typeof (value) == 'number' && !isNaN(value) && isFinite(value);
}

/** 格式化时间 */
export function formatDate(date, tmp) {
  if (!date && date != 0) return ''
  return DateUtil.format(date, tmp);
}

/** 解析时间 */
export function parseDate(str, tmp) {
  return DateUtil.parse(str, tmp);
}

/** 判定一个值是否为array like */
export function isArrayLike(value) {
  if (value == null || typeof value == 'function') return false;
  let len = value.length;
  return typeof len == 'number' && len > -1 && len % 1 == 0 && len <= MAX_SAFE_INTEGER;
}

/** 将一个值转换成数组，如果原值不是数组则返回[] */
export function toArray(value) {
  if (Array.isArray(value)) return value;
  if (isArrayLike(value)) return Array.prototype.slice.call(value);

  return [];
}

/** 删除字符串中所有的空格 */
export function trimAll(str) {
  return str.replace(/\s+/g, '');
}

/** 
 * 检测字符串长度
 * 单字节加1, 其他加2
 * @param {String} str - 要检测的字符串
 * @returns {Number} len - 长度
 */
export function stringLen(str) {
  if (typeof str != 'string') return 0;

  let len = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    // 单字节加1 
    if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
      len++;
    } else {
      len += 2;
    }
  }
  return len;
}

/**  
 * @description 格式化日期时间
 * @param {String} str -- 格式 2019-08-20 14:00:00
 * @returns {Date} date 对象
 */
export function parseDateTime(str) {
  let date = (
    /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s((?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$)/.test(str) ?
    new Date(str.replace(/-/g, '/')) :
    new Date()
  );

  return date;
}

export function fmt_gmt_time(time, jetLagHours = 8) {
  if (!time) return new Date();

  time = time.replace('T', ' ').replace('.000+0000', '');

  let date = parseDateTime(time).getTime();
  let hours = jetLagHours * 3600 * 1000;

  return new Date(date + hours);
}