import * as Lang from '@src/util/lang';


/** 格式化日期，支持毫秒 */
export function fmt_date(value){
  if(value instanceof Date || (typeof value == 'number' && !isNaN(value) && isFinite(value))){
    // eslint-disable-next-line no-param-reassign
    if(typeof value == 'number') value = new Date(value);

    return Lang.formatDate(value, 'YYYY-MM-DD');
  }
  return value;
}

/** 格式化日期时间，支持毫秒 */
export function fmt_datetime(value){
  if(value instanceof Date || (typeof value == 'number' && !isNaN(value) && isFinite(value))){
    // eslint-disable-next-line no-param-reassign
    if(typeof value == 'number') value = new Date(value);

    return Lang.formatDate(value, 'YYYY-MM-DD HH:mm:ss');
  }
  return value;
}

/** 取日期字符串的前16位 */
export function fmt_date_16(value){
  let reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s{1}(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
  return reg.test(value) ? value.slice(0, 16) : value;
}

/** 数字保留两位小数 */
export function fmt_number_fixed2(value){
  // 不是数字 或 是NaN 或 是无穷，直接返回原值
  if(!Lang.isSafeNumber(value)) return value;

  return value.toFixed(2);
}

/** 数字取整*/
export function fmt_number_int(value){
  if(!Lang.isSafeNumber(value)) return value;
  return Math.floor(value);
}

/** 格式化地址 */
export function fmt_address(value){
  // 这里null需要特判，因为 typeof null == 'object'
  if(null == value || typeof value != 'object') return value;

  let province = value.adProvince || value.province || '';
  let city = value.adCity || value.city || '';
  let dist = value.adDist || value.dist || '';
  let address = value.adAddress || value.address || '';
  
  return province + city + dist + address;
}

const fmt = {
  fmt_date,
  fmt_datetime,
  fmt_date_16,
  fmt_number_fixed2,
  fmt_number_int,
  fmt_address
}

export default fmt;