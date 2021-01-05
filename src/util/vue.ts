/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import HtmlTagAttributeNameEnum from '@model/enum/HtmlTagAttributeNameEnum'
import HtmlTagNameEnum from '@model/enum/HtmlTagNameEnum'
/* util */
import { isFunction, isString } from '@src/util/type'
import Log from '@src/util/log.ts'
/* vue */
import Vue from 'vue'

/**
 * @description: 获取vue实例
 * @param {Vue | Function | null} component 组件或者函数
 * @return {Vue} vue实例
*/
function getVueInstance(component: Vue | Function | null | undefined | any): Vue {
  // 已经被实例化过的组件
  if (component?._isVue) return component
  // 函数或类组件
  if (isFunction(component)) return new component() as Vue
  
  return new Vue()
}

/**
 * @description: vue挂载方法
 * @param {Vue} component 组件或者函数
 * @param {string} elementOrSelector 需要挂载的元素或者是选择器
 * @return {Vue} vue实例
*/
export function mount(component: Vue | Function, elementOrSelector: string | Element): Vue {
  Log.succ(Log.Start, mount.name)
  
  // 元素
  let element: Element | null = null
  // 是否为选择器
  let isSelector: boolean = isString(elementOrSelector)
  
  if (isSelector) {
    // 创建新元素
    element = document.createElement(HtmlTagNameEnum.Div)
    // 设置id属性
    element.setAttribute(HtmlTagAttributeNameEnum.ID, elementOrSelector as string)
    let body = document.body
    // 添加到body
    document.body.appendChild(element)
  } else {
    element = elementOrSelector as Element
  }
  
  Log.info(element, 'element', mount.name)
  
  // 获取实例
  let instance = getVueInstance(component)
  // 挂载
  instance.$mount(isSelector ? `#${elementOrSelector}` : element)
  
  Log.succ(Log.End, mount.name)
  
  return instance
}

export default {
  mount
}
