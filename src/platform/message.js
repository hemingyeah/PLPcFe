import dingtalk from '@src/util/dingtalk';
import {getRootWindow} from '../util/dom';

/**
 * 抹平钉钉和浏览器alert之间的差异
 * 
 * @param {*} message    提示信息
 * @param {*} title      标题
 * @param {*} buttonName 按钮名称
 */
export function alert(message = '', title = '提示', buttonName = '确定'){
  if(!dingtalk.inDingTalk) {
    window.alert(message);
    return Promise.resolve(true);
  }

  return dingtalk.device.alert(message, title, buttonName)
}

/**
 * 抹平钉钉和浏览器confirm的差异
 * 
 * @param {*} message   提示信息
 * @param {*} title     标题
 */
export function confirm(message = '', title = '提示'){
  if(!dingtalk.inDingTalk) return Promise.resolve(window.confirm(message));

  return dingtalk.device.confirm(message, title)
}

/** 
 * 全局通知消息
 * message选项可以传入vnode
 * ```javascript
 * notification({
 *   message: (function(h){
 *     return <div>hello world</div>
 *   })(this.$createElement)
 * })
 * ```
 * 
 * @see http://element-cn.eleme.io/#/zh-CN/component/notification
 * 
 * @param {Object} params - 配置项, 见notification文档
 * @param {String} params.content - 消息内容，该选项被认为是html
 * @returns Notification 实例
 */
export function notification(params = {}){
  let notification = getRootWindow(window).__exports__notification;
  if(typeof notification != 'function') return Promise.reject('[platform]: no notification function.');

  let opt = {};

  // content会覆盖message选项 
  if(params.content) {
    opt.message = params.content;
    opt.dangerouslyUseHTMLString = true;
  }
  
  opt.customClass = params.customClass ? `base-notification ${params.customClass}` : 'base-notification';

  return notification({...params, ...opt})
}