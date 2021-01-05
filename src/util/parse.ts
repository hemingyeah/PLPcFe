import { isString, isObject, isArray } from '@src/util/type'

/** 
 * @description 解析对象
 * -- 临时写的
*/
export function parseObject(value: any): any {
  // 是否为数组
  if (isArray(value)) return value.map((item: any) => parseObject(item))
  // 是否字符串
  if (isString(value)) {
    try {
      return JSON.parse(value)
    } catch (error) {
      return value
    }
  }
  // 是否是对象
  if (!isObject(value)) return value
  
  let newValue: any = {}
  
  for(let key in value) {
    let item = value[key]
    newValue[key] = parseObject(item)
  }
  
  return newValue
}

export default {
  parseObject
}