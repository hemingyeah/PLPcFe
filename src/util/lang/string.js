const DICT = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** 生成随机字符串 */
export function randomString(length = 8){
  let chars = [];
  for(let i = 0; i < length; i++) chars.push(DICT[Math.floor(Math.random() * DICT.length)])
  return chars.join('');
}