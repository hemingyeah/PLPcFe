import dingtalk from '@src/util/dingtalk';

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