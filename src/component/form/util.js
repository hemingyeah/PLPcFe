/** 返回一个随机key */
export const genRandomKey = function(){
  let random = Math.random() * 100000000 >> 0;
  return random.toString(16);
}