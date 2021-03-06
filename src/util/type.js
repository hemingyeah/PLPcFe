import _ from 'lodash';
import { typeOf } from './assist'

/** 
 * @description 是否为 字符串类型
*/
export function isString(string) {
  return typeOf(string) === 'string'
}

/** 
 * @description 是否为 数组类型
*/
export function isArray(array) {
  return Array.isArray(array) && typeOf(array) === 'array'
}

/** 
 * @description 是否为 数字类型
*/
export function isNumber(number) {
  return typeOf(number) === 'number' && !isNaN(number)
}

/** 
 * @description 是否为 布尔类型
*/
export function isBoolean(boolean) {
  return typeOf(boolean) === 'boolean'
}

/** 
 * @description 是否为 对象类型
*/
export function isObject(object) {
  return object && typeOf(object) === 'object'
}

/** 
 * @description 是否为 函数类型
*/
export function isFunction(func) {
  return func && typeOf(func) === 'function'
}

/** 
 * @description 是否为 undefined
*/
export function isUndefined(value) {
  return typeOf(value) === 'undefined'
}
/**
 * @description 是否为 null
 */
export function isNull(value) {
  return typeOf(value) === 'null'
}

/** 
 * @description 是否为 空
*/
export function isEmpty(value) {
  return _.isEmpty(value)
}

/** 
 * @description 是否为 DOM元素
*/
export function isElement(element) {
  return _.isElement(element)
}
