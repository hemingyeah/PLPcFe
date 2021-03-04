/* uitl */
import Log from '@src/util/log.ts'
import { getRootWindow } from '@src/util/dom'
/* type */
import RootWindowInitData from '@model/types/RootWindowInitData'

/**
 * @description: 获取根窗口初始化数据
 * @param {*}
 * @return {*}
*/
export function getRootWindowInitData(): RootWindowInitData {
  try {
    const RootWindow: any = getRootWindow(window)
    return JSON.parse(RootWindow._init) || {}
  } catch (error) {
    Log.error(error, getRootWindowInitData.name)
    return {}
  }
}

export default {
  getRootWindowInitData
}