/** 进一步封装fecha 
 * @see https://github.com/taylorhakes/fecha 
 * 
                      Token	    Output
  --------------------------------------------------------------------                    
  Month	              M	        1 2 ... 11 12
                      MM	      01 02 ... 11 12
                      MMM	      Jan Feb ... Nov Dec
                      MMMM	    January February ... November December
  --------------------------------------------------------------------                    
  Day of Month	      D	        1 2 ... 30 31
                      Do	      1st 2nd ... 30th 31st
                      DD	      01 02 ... 30 31
  --------------------------------------------------------------------                    
  Day of Week         d	        0 1 ... 5 6
                      ddd	      Sun Mon ... Fri Sat
                      dddd	    Sunday Monday ... Friday Saturday
  --------------------------------------------------------------------                    
  Year	              YY	      70 71 ... 29 30
                      YYYY	    1970 1971 ... 2029 2030
  --------------------------------------------------------------------
  AM/PM	              A	        AM PM
                      a	        am pm
  --------------------------------------------------------------------
  Hour	              H	        0 1 ... 22 23
                      HH	      00 01 ... 22 23
                      h	        1 2 ... 11 12
                      hh	      01 02 ... 11 12
  --------------------------------------------------------------------
  Minute	            m	        0 1 ... 58 59
                      mm	      00 01 ... 58 59
  --------------------------------------------------------------------
  Second	            s	        0 1 ... 58 59
                      ss	      00 01 ... 58 59
  --------------------------------------------------------------------
  Fractional Second	  S	        0 1 ... 8 9
                      SS	      0 1 ... 98 99
                      SSS	      0 1 ... 998 999
  --------------------------------------------------------------------
  Timezone	          ZZ	      -0700 -0600 ... +0600 +0700
  --------------------------------------------------------------------
 * 
 * */
import fecha from 'fecha';

fecha.i18n = {
  dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  monthNamesShort: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
  monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  amPm: ['上午', '下午']
}

fecha.masks = {
  'default': 'YYYY-MM-DD HH:mm:ss'
}

let _parse = fecha.parse;
/** 劫持fecha的parse函数，支持按毫秒数解析时间 */
fecha.parse = function(str, format, i18nSettings) {
  if(typeof str == 'number') return new Date(str);

  return _parse.call(fecha, str, format, i18nSettings)
}

export default fecha;