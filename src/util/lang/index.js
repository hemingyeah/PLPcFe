export * from './string'

import DateUtil from './date';

const MAX_SAFE_INTEGER = 9007199254740991;

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

/** 判定一个值是否为array like */
export function isArrayLike(value) {
  if(value == null || typeof value == 'function') return false;
  let len = value.length;
  return typeof len == 'number' && len > -1 && len % 1 == 0 && len <= MAX_SAFE_INTEGER;
}

/** 将一个值转换成数组，如果原值不是数组则返回[] */
export function toArray(value){
  if(Array.isArray(value)) return value;
  if(isArrayLike(value)) return Array.prototype.slice.call(value);

  return [];
}

/** 删除字符串中所有的空格 */
export function trimAll(str){
  return str.replace(/\s+/g, '');
}

/** 
 * 检测字符串长度
 * 单字节加1, 其他加2
 * @param {String} str - 要检测的字符串
 * @returns {Number} len - 长度
*/
export function stringLen(str) {
  if(typeof str != 'string') return 0;

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