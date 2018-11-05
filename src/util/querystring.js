//https://github.com/ljharb/qs
import qs from 'qs';

/** 
 * 拆解字符串，封装成对象
 * a=1 => {a: 1}
 */
export function parse(str = ""){
  if(typeof str == 'string' && str.startsWith('?')) str = str.substring(1);
  return qs.parse(str);
}

/**
 * 序列化对象
 * {a: 1} => a = 1
 */
export function stringify(params){
  return qs.stringify(params, {arrayFormat: 'brackets'})
}

const querystring = {
  parse,
  stringify
}

export default querystring;