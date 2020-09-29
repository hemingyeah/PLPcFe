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
  return str < 10 ? ('0' + str) : str;
}

/**
 * 格式化时间
 */
function format(date, tpl = "yyyy-MM-dd HH:mm:ss", isUTC = false) {
  var utc = isUTC ? 'UTC' : '';
  var y = date['get' + utc + 'FullYear']();
  var M = date['get' + utc + 'Month']() + 1;
  var d = date['get' + utc + 'Date']();
  var h = date['get' + utc + 'Hours']();
  var m = date['get' + utc + 'Minutes']();
  var s = date['get' + utc + 'Seconds']();

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


export default {
  lastDayOfMonth,
  firstDayOfMonth,
  rangeOfMonth,
  format,
  datedifference,
  parseDateTime
};