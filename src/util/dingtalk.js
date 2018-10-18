/** 所有和钉钉相关的api都维护在此 */
import {getRootWindow} from '../util/dom';

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
 */
function inDingTalk(){
  let dingtalk = getDingTalkPC();
  return null != dingtalk && dingtalk.ua && dingtalk.ua.isDesktop;
}

/** 钉钉api签名 */
function sign(config = {}){
  window._global_data_corpId = config.corpId;
  let DingTalkPC = getDingTalkPC();

  return new Promise((resolve, reject) => {
    DingTalkPC.config({
      agentId:config.agentId,
      corpId: config.corpId,
      timeStamp:config.timeStamp,
      nonceStr:config.nonceStr,
      signature:config.signature,
      jsApiList: [
        'runtime.permission.requestAuthCode',
        'biz.util.openLink',
        'device.notification.alert',
        'service.request.httpOverLwp',
        'biz.ding.post'
      ]
    });
    
    //签名成功
    DingTalkPC.ready(function(){
      resolve();
      console.info("========== DingTalkPC ready ==========");
    });
    
    //签名失败
    DingTalkPC.error(function(error){  
      console.info("========== DingTalkPC error ==========");
      reject(error)
    });
  });
}

/**
 * alert弹窗
 * 钉钉中屏蔽原生alert,使用钉钉api替代
 * 
 * @param {*} message     信息
 * @param {*} title       弹窗标题
 * @param {*} buttonName  按钮名
 */
function alert(message = '', title = '提示', buttonName = '确定'){
  let DingTalkPC = getDingTalkPC();

  return new Promise((resolve, reject) => {
    DingTalkPC.device.notification.alert({
      message: message,
      title: title, //可传空
      buttonName: buttonName,
      onSuccess: () => resolve(true),
      onFail: err => {
        console.error(err);
        resolve(false)
      }
    });
  })
} 

/**
 * confirm弹窗
 * 钉钉中屏蔽原生confirm,使用钉钉api替代
 * 
 * @param {*} message   信息
 * @param {*} title     弹窗标题
 */
function confirm(message = '', title = '提示'){
  let DingTalkPC = getDingTalkPC();
    
  return new Promise((resolve, reject) => {  
    DingTalkPC.device.notification.confirm({
      message: message,
      title: title,
      buttonLabels: ['是','否'],
      onSuccess: result => resolve(result.buttonIndex == 0),
      onFail: err => {
        console.error(err);
        resolve(false)
      }
    });
  });
}

/**
 * 在新的窗口打开链接
 * 
 * @param {*} url   待打开的链接，必须是全路径
 */
function openLink(url){
  let DingTalkPC = getDingTalkPC();

  DingTalkPC.biz.util.openLink({
    url,
    onFail: err => console.error(err)
  });
}

/** 预览图片 */
function previewImage(currUrl, urls = []){
  let DingTalkPC = getDingTalkPC();

  DingTalkPC.biz.util.previewImage({
    urls: urls,
    current: currUrl,
    onFail: err => console.error(err)
  })
}

const dingtalk = {
  sign,
  inDingTalk: inDingTalk(),
  device: {alert, confirm},
  biz: {openLink, previewImage}
}

export default dingtalk;