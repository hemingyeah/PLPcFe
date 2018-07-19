/** 用于抹平浏览器和钉钉之间的差异 @author dongls */
import dingtalk from 'src/util/dingtalk';

/**
 * 用于获取顶层window
 * 顶层window中添加了一个特殊属性[__root_window_],因此判断该属性即可
 * 
 * 注：不适合使用惰性函数改写
 * 
 * @param win - 当前窗口window对象
 */
function getRootWindow(win) {
  //非frame 环境
  if(win === window.top) return win;

  if(win.parent.__root_window_ == 'root') return win.parent;
  return getRootWindow(win.parent);
}

/**
 * 用于获取DingtalkPC对象,该对象由钉钉提供
 * 由于目前只在最外层签名，所以调用钉钉api之前应先调用此方法
 */
function getDingTalkPC(){
  return getRootWindow(window).DingTalkPC;
}

/**
 * 判断是否在钉钉内
 * 由于是跨ifame获取到的dingtalk对象，所以instanceOf操作符不适用
 * 
 * @param dingtalk - dingtalk对象，若不传则会获取
 */
function inDingTalk(dingtalk){
  if(null == dingtalk) dingtalk = getDingTalkPC();
  if(null == dingtalk) return false;

  return dingtalk.ua && dingtalk.ua.isDesktop;
}

/**
 * 抹平钉钉和浏览的alert之间的差异
 * 
 * @param {*} message - 提示信息
 * @param {*} title - 标题
 * @param {*} buttonName - 按钮名称
 */
function alert(message = '', title = '提示', buttonName = '确定'){
  let dingtalk = getDingTalkPC();

  if(!inDingTalk(dingtalk)) {
    window.alert(message);
    return Promise.resolve(true);
  }

  return new Promise((resolve, reject) => {
    dingtalk.device.notification.alert({
      message: message,
      title: title, //可传空
      buttonName: buttonName,
      onSuccess: function() {
        resolve(true)
      },
      onFail: err => {
        console.log(err);
        resolve(false)
      }
    });
  })
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

/**
 * 抹平钉钉和浏览器confirm的差异
 * 
 * @param {*} message 
 * @param {*} title 
 */
function confirm(message = '', title = '提示'){
  let dingtalk = getDingTalkPC();
  if(!inDingTalk(dingtalk)) return Promise.resolve(window.confirm(message));
    
  return new Promise((resolve, reject) => {  
    dingtalk.device.notification.confirm({
      message: message,
      title: title,
      buttonLabels: ['是','否'],
      onSuccess: result => resolve(result.buttonIndex == 0),
      onFail: err => {
        console.log(err);
        resolve(false)
      }
    });
  });
}

/**
 * 在新的窗口打开链接
 * 
 * @param {*} url 
 */
function openLink(url){
  let dingtalk = getDingTalkPC();
  if(!inDingTalk(dingtalk)) return window.open(url)

  dingtalk.biz.util.openLink({
    url: url //要打开链接的地址
  })
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

export default {
  getRootWindow,
  getDingTalkPC,
  inDingTalk,
  alert,
  confirm,
  openTab,
  openLink
};