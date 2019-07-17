/** 
 * 基数帧数的节流函数，比setTimeout时间更精确 
 * 1帧约为16.66666ms
 */
export function frameThrottle(callback, max = 5){
  let count = 0;
  let raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
  let timer = function(){
    count++;
    count <= max && raf(timer);
  }
  
  return function(){  
    if(count >= max){
      count = 0;
      return callback.apply(this, arguments);
    }

    timer();
  };
}

/**  
 * 判断当前
*/
export function isEmptyStringObject(object = {}){
  if(!object || Object.keys(object).length <= 0 ) return true;
  
  let isEmpty = true;
  let item = null;

  for(let key in object) {
    item = object[key];
    if(String(item)) {
      isEmpty = false;
      break;
    }
  }

  return isEmpty;

}