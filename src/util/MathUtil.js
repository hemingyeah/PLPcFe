/**
 * 计算小数位数
 * @param {Number} num 
 */
function decimalNumber (num) {
  let index = String(num).indexOf('.');
  if(index == -1) return 0;

  let count = String(num).length - (index + 1);
  return count;
}

export default {
  decimalNumber
}