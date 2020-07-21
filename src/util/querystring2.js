
function parse(qs, sep, eq) {
    const obj = Object.create(null);
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
  
    if(qs.indexOf("?") == 0) qs = qs.substring(1);
  
    sep = sep || '&';
    eq = eq || '=';
    const params = qs.split(sep);
    let i = 0;
    let l = params.length;
    for (; i < l; i++) {
      let items = params[i].split(eq);
      let queryKey = items[0].trim();
      let queryVal = '';
      if (items.length >= 3) {
        items.splice(0, 1);
        let lastIndex = items.length - 1;
        items.forEach(function (v, i) {
          v = v.trim();
          if (i === lastIndex) {
            queryVal += v;
          } else {
            queryVal += v + eq
          }
        });
      } else {
        queryVal = items[1].trim();
      }
      let cur = obj[queryKey];
      if (cur) {
        if (Array.isArray(cur)) {
          cur.push(decodeURIComponent(queryVal));
        } else {
          let temp = cur;
          obj[queryKey] = [];
          obj[queryKey].push(temp);
          obj[queryKey].push(decodeURIComponent(queryVal));
        }
      } else {
        obj[queryKey] = decodeURIComponent(queryVal);
      }
    }
    return obj;
  }
  
  /**
   * 将对象序列化成服务器可接受的字符串, 不会转换原型链上的属性
   * 
   * 注：目前套嵌深度最大支持1层，不支持多次套嵌
   * 
   * 2018-03-05 支持Object类型参数
   * 
   * @example {a:1,b:2} => a=1&b=2
   * @author dongls
   * 
   * @param {object} obj - 待序列化的参数
   * @param {object} options - 可选配置
   * @param {string} options.parentProp - 指定当前属性的父属性，用与套嵌对象的处理
   * 
   * @returns {string} 序列化后的字符串
   */
  function stringify(obj, options = {
    parentProp: ''
  }){
    if(null == obj || (typeof obj === 'object' && Object.keys(obj).length == 0)) return '';
    let arr = [];
    let parentProp = options.parentProp;
  
    Object.keys(obj).forEach(key => {
      let value = obj[key];
      if(value == null) return;
  
      if(Array.isArray(value)){
        value.forEach(item => arr.push(`${genKey(key,parentProp)}=${encodeURIComponent(item)}`))
      }else if(typeof value == 'object'){
        let str = stringify(value, {parentProp: genKey(key, parentProp)})
        if(str) arr.push(str)
      }else {
        arr.push(`${genKey(key, parentProp)}=${encodeURIComponent(value)}`)
      }
    })
  
    return arr.join("&");
  }
  
  function genKey(key, parentProp){
    return parentProp ? `${parentProp}${encodeURIComponent('[')}${key}${encodeURIComponent(']')}` : key;
  }
  
  export default {
    stringify,
    parse
  };
