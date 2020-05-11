/**
 * 验证给定的权限对象是否包含某一指定的权限,
 * 
 * @param {*} auth 权限对象 
 * @param {*} key 权限值,支持字符串和数组
 */
function hasAuth(auth = {}, keys){
  if(!Array.isArray(keys)) keys = [keys];

  let authKeys = Object.keys(auth);
  if(keys.length == 0) return false;

  return keys.some(item => authKeys.indexOf(item) >= 0);
}

/**
 * 验证给定的权限对象是否包含全部给定的权限
 * @param {*} auth - 权限对象 
 * @param {*} key - 权限值,支持字符串和数组
 */
function hasEveryAuth(auth = {}, keys){
  if(!Array.isArray(keys)) keys = [keys];

  let authKeys = Object.keys(auth);
  if(keys.length == 0) return false;

  return keys.every(item => authKeys.indexOf(item) >= 0);
}

export default {
  hasAuth,
  hasEveryAuth
}
