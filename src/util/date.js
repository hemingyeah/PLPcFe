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


export default {
  lastDayOfMonth,
  firstDayOfMonth,
  rangeOfMonth,
  format
};