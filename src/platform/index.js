/** 用于抹平浏览器和钉钉之间的差异 @author dongls */
import {getRootWindow} from '../util/dom';
import dingtalk from '@src/util/dingtalk';
import BaseGallery from '@src/component/common/BaseGallery';

/**
 * 抹平钉钉和浏览器alert之间的差异
 * 
 * @param {*} message    提示信息
 * @param {*} title      标题
 * @param {*} buttonName 按钮名称
 */
function alert(message = '', title = '提示', buttonName = '确定'){
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
function confirm(message = '', title = '提示'){
  if(!dingtalk.inDingTalk) return Promise.resolve(window.confirm(message));

  return dingtalk.device.confirm(message, title)
}

// /**
//  * @see http://element.eleme.io/#/zh-CN/component/message
//  * 
//  * @param {*} message - 提示信息 
//  * @param {*} type 
//  * @param {*} options 
//  */
// function toast(message, type = 'success', options = {}) {
//   return new Promise((resolve, reject) => {
//     Message({ //eslint-disable-line
//       message: message,
//       duration: options.duration || 1500,
//       type: type,
//       onClose: () => resolve()
//     })
//   })
// }


/** 在新的窗口打开链接，链接必须是全路径 */
function openLink(url){
  if(!dingtalk.inDingTalk) return window.open(url)

  return dingtalk.biz.openLink(url);
}

/** 打开一个的tab，如果已经存在则跳转至对应的tab */
function openTab(data){
  let win = getRootWindow(window);
  let origin = window.location.origin;
  
  let message = {
    action: 'shb.system.openFrameTab',
    data: data
  };

  win.postMessage(message, origin)
}

/**
 * 图片预览
 *
 * @param {*} imageDom - img dom
 * @param {*} imgUrl - 图片链接
 */
function imagePreview({ imageDom, imgUrl}) {
  if(!dingtalk.inDingTalk) return BaseGallery.preview(imageDom);
  
  return dingtalk.biz.previewImage(imgUrl, [imgUrl])
}

const platform = {
  alert,
  confirm,
  openTab,
  openLink,
  imagePreview
}

export default platform;