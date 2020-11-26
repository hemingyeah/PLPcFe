/* util */
import { isNumber, isString } from '@src/util/type'

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

/** 
 * @description 将秒转换成时分文字显示
*/
export function convertSecondsToHourMinuteText(minutes: number): string {
  if (!isNumber(minutes)) return ''
  
  let minute = 60
  let second = 60
  let hour = parseInt(String(minutes / (minute * second)))
  let surplus = parseInt(String(minutes % (minute * second) / minute))
  
  return `${hour}H${ surplus ? `${surplus}M` : ''}`
}