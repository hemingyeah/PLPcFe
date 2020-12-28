import Log from '@src/util/log.ts'

/**
 * 获取vue组件名称
 * @param {Vue} vue对象
 * @author      huangbaocheng
 * @date       2020/12/21 9:50 下午
 * @exception
 * @return {String} 组件名称
 */
function getVueComponentName(vue = {}) {
  return vue?.$options?.componentName || vue?.$options?.name
}

function broadcastInside(componentName, eventName, params) {
  let name = null

  this.$children.forEach(child => {
    name = getVueComponentName(child)
    
    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params))
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]))
    }
  })

}

export function dispatch(componentName, eventName, params) {
  Log.succ(Log.Start, dispatch.name)
  Log.info(componentName, 'componentName', dispatch.name)
  Log.info(eventName, 'eventName', dispatch.name)
  Log.info(params, 'params', dispatch.name)

  let parent = this.$parent || this.$root
  let name = getVueComponentName(parent)
  
  while (parent && (!name || name !== componentName)) {
    parent = parent.$parent
    
    if (parent) {
      name = getVueComponentName(parent)
    }
  }
  
  if (parent) {
    parent.$emit.apply(parent, [eventName].concat(params))
  }
}

export function broadcast(componentName, eventName, params) {
  broadcastInside.call(this, componentName, eventName, params)
}