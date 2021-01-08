import { typeOf } from './assist'

/** 
 * @description 是否为空对象
*/
export function isEmpty(object = {}) {
  return object && typeOf(object) === 'object' && Object.keys(object).length <= 0
}

export default {
  isEmpty
}