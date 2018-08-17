import * as Lang from '@src/util/lang'

const fmt = {
  /** 格式化日期，支持毫秒 */
  fmt_date(value){
    if(value instanceof Date || (typeof value == 'number' && !isNaN(value) && isFinite(value))){
      if(typeof value == 'number') value = new Date(value);

      return Lang.formatDate(value, "YYYY-MM-DD");
    }
    return value;
  },

  /** 格式化日期时间，支持毫秒 */
  fmt_datetime(value){
    if(value instanceof Date || (typeof value == 'number' && !isNaN(value) && isFinite(value))){
      if(typeof value == 'number') value = new Date(value);

      return Lang.formatDate(value, "YYYY-MM-DD HH:mm:ss");
    }
    return value;
  },

  /** 取日期字符串的前16位 */
  fmt_date_16(value){
    let reg = /^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s{1}(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
    return reg.test(value) ? value.slice(0,16) : value;
  },

  /** 数字保留两位小数 */
  fmt_number_fixed2(value){
    //不是数字 或 是NaN 或 是无穷，直接返回原值
    if(!Lang.isSafeNumber(value)) return value;
  
    return value.toFixed(2);
  },

  /** 数字取整*/
  fmt_number_int(value){
    if(!Lang.isSafeNumber(value)) return value;
    return Math.floor(value);
  },

  /** 格式化地址 */
  fmt_address(value){
    if(typeof value != 'object' || value.constructor != Object) return value;

    let province = value.adProvince || value.province || '';
    let city = value.adCity || value.city || '';
    let dist = value.adDist || value.dist || '';
    let address = value.adAddress || value.address || '';
    
    return province + city + dist + address;
  }
};

export default fmt;