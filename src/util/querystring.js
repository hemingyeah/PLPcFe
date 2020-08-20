// https://github.com/ljharb/qs
import qs from 'qs';

/** 
 * 拆解字符串，封装成对象
 * a=1 => {a: 1}
 */
export function parse(str = ''){
  let copyStr = str;
  if(typeof copyStr == 'string' && copyStr.startsWith('?')) copyStr = copyStr.substring(1);
  return qs.parse(copyStr);
}

/**
 * 序列化对象
 * {a: 1} => a = 1
 */
export function stringify(params){
  return qs.stringify(params, {arrayFormat: 'indices'})
}

const querystring = {
  parse,
  stringify
}

export default querystring;