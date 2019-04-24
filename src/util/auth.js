/**
 * 验证给定的权限对象是否包含某一指定的权限,
 * 
 * @param {*} auth 权限对象 
 * @param {*} key 权限值,支持字符串和数组
 */
export function hasAuth(auth = {}, keys){
  let copyKeys = keys;
  if(!Array.isArray(copyKeys)) copyKeys = [copyKeys];

  let authKeys = Object.keys(auth);
  if(copyKeys.length == 0) return false;

  return copyKeys.some(item => authKeys.indexOf(item) >= 0);
}

/**
 * 验证给定的权限对象是否包含全部给定的权限
 * @param {*} auth - 权限对象 
 * @param {*} key - 权限值,支持字符串和数组
 */
export function hasEveryAuth(auth = {}, keys){
  let copyKeys = keys;
  if(!Array.isArray(copyKeys)) copyKeys = [copyKeys];

  let authKeys = Object.keys(auth);
  if(copyKeys.length == 0) return false;

  return copyKeys.every(item => authKeys.indexOf(item) >= 0);
}

/** 根据用户的数据权限判断是否有某一权限 */
export function hasAuthWithDataLevel(authorities = {}, authKey, teamAuthFn, personAuthFn){
  let dataLevel = authorities[authKey];
  // 如果没有对应的权限
  if(!dataLevel) return false;
  // 全部权限
  if(dataLevel >= 3) return true;

  let teamAuth = ( 
    typeof teamAuthFn == 'function' 
      ? teamAuthFn() : 
      typeof teamAuthFn == 'boolean' ? teamAuthFn : false
  );

  let personAuth = (
    typeof personAuthFn == 'function' 
      ? personAuthFn() : 
      typeof personAuthFn == 'boolean' ? personAuthFn : false
  );

  // 团队权限 dataLevel = 2
  if(dataLevel > 1 && dataLevel < 3){
    return teamAuth || personAuth;
  }

  return personAuth;
}

const util = {
  hasAuth,
  hasEveryAuth,
  hasAuthWithDataLevel
}

export default util;