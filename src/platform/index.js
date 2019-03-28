/** 用于抹平浏览器和钉钉之间的差异 @author dongls */
import {getRootWindow} from '../util/dom';
import dingtalk from '@src/util/dingtalk';
import BaseGallery from '@src/component/common/BaseGallery';

import {alert, confirm, notification} from './message';

/** 在新的窗口打开链接，链接必须是全路径 */
function openLink(url){
  if(!dingtalk.inDingTalk) return window.open(url)

  return dingtalk.biz.openLink(url);
}

/** 
 * 打开一个的tab，如果已经存在则跳转至对应的tab 
 * 
 * tab的id属性按以下格式命名：`[module]_[page](_${key})*`  
 * 示例：customer_view_0fe58f8b-b698-4fc0-9ddb-8ca155452e9
 * 
 * @param {Object} options - tab对应的options，一般包含以下属性{id,title,close,url,fromId}
 * @param {string} options.id - id
 * @param {string} options.title - title
 * @param {string} options.close - 是否允许关闭tab
 * @param {string} options.url - tab对应的url
 * @param {string} options.fromId - 打开该tab的源tab的id
 */
function openTab(options){
  let win = getRootWindow(window);
  let origin = window.location.origin;
  
  let message = {
    action: 'shb.system.openFrameTab',
    data: options
  };

  win.postMessage(message, origin)
}

/** 根据tab刷新tab */
function refreshTab(id){
  let win = getRootWindow(window);
  let origin = window.location.origin;
  
  let message = {
    action: 'shb.system.realodFrameById',
    data: id
  };

  win.postMessage(message, origin)
}

/** 根据id, 关闭tab */
function closeTab(id) {
  let win = getRootWindow(window);
  let origin = window.location.origin;

  let message = {
    action: 'shb.system.closeFrameById',
    data: id
  };

  win.postMessage(message, origin)
}

/**
 * 图片预览
 *
 * @param {*} imageDom - img dom
 * @param {*} imgUrl - 图片链接
 */
function imagePreview({ imageDom, urls, currIndex = 0}) {
  return BaseGallery.preview(imageDom, currIndex, urls.length > 1);
  // return dingtalk.biz.previewImage(urls, urls[currIndex])
}

export const platform = {
  inDingTalk: dingtalk.inDingTalk,

  alert,
  confirm,
  notification,

  openTab,
  refreshTab,
  closeTab,

  openLink,
  imagePreview,
};

export default platform;
