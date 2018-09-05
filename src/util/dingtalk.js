/*global DingTalkPC:true*/

/** 钉钉api签名 */
function sign(config = {}){
  window._global_data_corpId = config.corpId;

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
    DingTalkPC.ready(function () {
      resolve();
      console.info("========== DingTalkPC ready ==========");
    });
    
    //签名失败
    DingTalkPC.error(function (error) {  
      console.info("========== DingTalkPC error ==========");
      reject(error)
    });
  });
}

const dingtalk = {
  sign
}

export default dingtalk;