import { isString } from '@src/util/type'

/**
 * 当月最后一天
 */
function lastDayOfMonth(date){
  let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  lastDay.setDate(0);
  return lastDay;
}

/**
 * 当月第一天
 */
function firstDayOfMonth(date){
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * 返回指定月份开始时间和结束时间
 */
function rangeOfMonth(date){
  return [firstDayOfMonth(date), lastDayOfMonth(date)];
}

function s2d(str) {
  return str < 10 ? (`0${ str}`) : str;
}

/**
 * 格式化时间
 */
function format(date, tpl = 'yyyy-MM-dd HH:mm:ss', isUTC = false) {
  let utc = isUTC ? 'UTC' : '';
  let y = date[`get${ utc }FullYear`]();
  let M = date[`get${ utc }Month`]() + 1;
  let d = date[`get${ utc }Date`]();
  let h = date[`get${ utc }Hours`]();
  let m = date[`get${ utc }Minutes`]();
  let s = date[`get${ utc }Seconds`]();

  tpl = tpl.replace('MM', s2d(M))
    .replace('M', M)
    .replace('yyyy', y)
    .replace('yy', y % 100)
    .replace('dd', s2d(d))
    .replace('d', d)
    .replace('HH', s2d(h))
    .replace('h', h)
    .replace('mm', s2d(m))
    .replace('m', m)
    .replace('ss', s2d(s))
    .replace('s', s);

  return tpl;
}

/** 
 * @description 抄的jsp之前的
 * sDate1和sDate2是2006-12-18格式 
*/
function datedifference(sDate1, sDate2) {
  let dateSpan, iDays;
  sDate1 = Date.parse(sDate1);
  sDate2 = Date.parse(sDate2);
  dateSpan = sDate2 - sDate1;
  dateSpan = Math.abs(dateSpan);
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  return iDays
}

/**  
 * @description 格式化日期时间
 * @param {String} str -- 格式 2019-08-20 14:00:00
 * @returns {Date} date 对象
*/
function parseDateTime(str) {
  let date = (
    /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s((?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$)/.test(str)
      ? new Date(str.replace(/-/g, '/'))
      : new Date()
  );

  return date;
}

/**
 * @description 获取两个时间之间的的差值
 * -- 抄的移动端的
 * @param {Date} time 要比较的时间
 * @param {Date} time2 比较时间2, 默认为为当前时间
 * @param {String} minimumStr 最小单位显示，小于一分钟时如何显示
 * 
 * @return {String} 时间差， x天，x小时，x分钟
 */
function getTimeDiffStr(time1, time2 = new Date(), minimumStr = '1分钟') {
  if(!time1) return ''
  
  let result = ''
  
  time1 = parse(time1) ? parse(time1).getTime() : new Date(time1).getTime()
  
  let timeDiff = new Date(time2).getTime() - time1
  timeDiff = Math.abs(timeDiff)
  
  let minuteMs = 60 * 1000
  let hourMinutes = 60
  
  let days = Math.floor(timeDiff / (24 * hourMinutes * minuteMs))
  let dayStamp = days * 24 * hourMinutes * minuteMs
  let hours = Math.floor((timeDiff - dayStamp) / (hourMinutes * minuteMs))
  let hoursStamp = hours * hourMinutes * minuteMs
  let minute = Math.floor((timeDiff - dayStamp - hoursStamp) / minuteMs)
  
  let noDayNoHours = !days && !hours
  
  days && (result += `${days}天`)
  hours && (result += `${hours}小时`)
  
  // 显示 x天x小时  或者  x小时x分钟
  if (minute && !days) {
    result += `${minute}分钟`
  } else if (noDayNoHours && !minute) {
    result += minimumStr
  }
  
  return result
}

function parse(str){
  try {
    if (isString(str)) {
      return new Date(str.replace(/\-/g, '/'))
    }
    
    return new Date(str)
    
  } catch (error) {
    console.error('date.js ~ parse ~ error', error)
    return null
  }
}

export default {
  lastDayOfMonth,
  firstDayOfMonth,
  rangeOfMonth,
  format,
  datedifference,
  parseDateTime,
  getTimeDiffStr
};