/** 
 * @description 是否是之前的时间
 * @param {String | Number} time 时间
 * @returns {Boolean}
*/
export function isBeforeTime(time: number | string): boolean {
  let isBeforeTime = false
  
  try {
    isBeforeTime = new Date(time).getTime() < new Date().getTime()
  } catch (error) {
    isBeforeTime = false
    console.log('time.ts isBeforeTime ~ error', error)
  }
  
  return isBeforeTime
}