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

/** 格式化时间，返回到分钟 */
export function fmt_datehour(value){
  if(value instanceof Date || (typeof value == 'number' && !isNaN(value) && isFinite(value))){
    if(typeof value == 'number') value = new Date(value);

    return Lang.formatDate(value, 'YYYY-MM-DD HH:mm');
  }
  return value;
}

/** 取日期字符串的前16位 */
export function fmt_date_16(value){
  let reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s{1}(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
  return reg.test(value) ? value.slice(0, 16) : value;
}

export function fmt_short_time(shorttime){
  if(!shorttime) return ''
  shorttime = new Date(shorttime).getTime();
  let now = (new Date()).getTime();
  let cha = (now - parseInt(shorttime)) / 1000;
  
  if (cha < 43200) {
    // 当天
    return dateFormat(new Date(shorttime), '{A} {t}:{ii}');
  } else if(cha < 518400){
    // 隔天 显示日期+时间
    return dateFormat(new Date(shorttime), '{Mon}月{DD}日 {A} {t}:{ii}');
  } 
  // 隔年 显示完整日期+时间
  return dateFormat(new Date(shorttime), '{Y}-{MM}-{DD} {A} {t}:{ii}');
  
}

export function dateFormat(date, formatStr) {
  let dateObj = {},
    rStr = /\{([^}]+)\}/,
    mons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
   
  dateObj['Y'] = date.getFullYear();
  dateObj['M'] = date.getMonth() + 1;
  dateObj['MM'] = parseNumber(dateObj['M']);
  dateObj['Mon'] = mons[dateObj['M'] - 1];
  dateObj['D'] = date.getDate();
  dateObj['DD'] = parseNumber(dateObj['D']);
  dateObj['h'] = date.getHours();
  dateObj['hh'] = parseNumber(dateObj['h']);
  dateObj['t'] = dateObj['h'] > 12 ? dateObj['h'] - 12 : dateObj['h'];
  dateObj['tt'] = parseNumber(dateObj['t']);
  dateObj['A'] = dateObj['h'] > 12 ? '下午' : '上午';
  dateObj['i'] = date.getMinutes();
  dateObj['ii'] = parseNumber(dateObj['i']);
  dateObj['s'] = date.getSeconds();
  dateObj['ss'] = parseNumber(dateObj['s']);
 
  while(rStr.test(formatStr)) {
    formatStr = formatStr.replace(rStr, dateObj[RegExp.$1]);
  }
  return formatStr;
}

export function parseNumber(num) {
  return num < 10 ? `0${num}` : num;
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

// 工单状态
export function fmt_state(value) {
  let state = ''
  switch (value) {
  case 'created':
    state = '待分配';
    break;
  case 'allocated':
    state = '待处理';
    break;
  case 'processing':
    state = '处理中';
    break;
  case 'convert2Task':
    state = '转工单';
    break;
  case 'finished':
    state = '已完成';
    break;
  case 'offed':
    state = '已取消';
    break;

  default:
    break;
  }
  return state
}

const fmt = {
  fmt_date,
  fmt_datetime,
  fmt_date_16,
  fmt_number_fixed2,
  fmt_number_int,
  fmt_address,
  fmt_datehour,
  fmt_state,
  fmt_short_time
}

export default fmt;