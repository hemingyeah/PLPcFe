/** @deprecated 只用于兼容旧版本，新页面不推荐使用 Created by dongls on 2017/5/6. */
(function () {
  //判断是否在钉钉pc端
  window.inDingTalkPC = function () {
    return window.DingTalkPC && window.DingTalkPC.ua.isDesktop;
  }
  
  //判断是否为钉钉环境
  window.isDingTalk = function () {
    try {
      let location = window.location || {}
      return window.inDingTalkPC() || location.hostname.endsWith('shb.ltd')
    } catch (error) {
      console.warn('dingtalkUtil-v2.js ~ isDingTalk ~ error', error)
      return false
    }
  }
  
  //============================alert实现=================================
  window.dd_alert = function (message, title, buttonName, id, callback) {
    if (window.DingTalkPC && window.DingTalkPC.ua.isDesktop) {
      window.DingTalkPC.device.notification.alert({
        message: message,
        title: title || '提示',//可传空
        buttonName: buttonName || '确定',
        onSuccess: function () { },
        onFail: function (err) { }
      });
    } else {
      alert(message);
    }
  };

  //====================================confirm 实现========================================
  window.dd_confirm = function (message, callback, title, buttonNames) {
    if (window.DingTalkPC && window.DingTalkPC.ua.isDesktop) {
      window.DingTalkPC.device.notification.confirm({
        message: message,
        title: title || '提示',//可传空
        buttonLabels: buttonNames || ['是', '否'],
        onSuccess: function (result) {
          if (typeof callback == 'function') callback(result.buttonIndex)
        },
        onFail: function (err) { }
      });
    } else {
      if (confirm(message)) {
        if (typeof callback == 'function') callback(0)
      } else {
        if (typeof callback == 'function') callback(1)
      }
    }
  };

  //====================================openLink 实现========================================
  window.dd_openLink = function (url) {
    if (window.DingTalkPC && window.DingTalkPC.ua.isDesktop) {
      console.log('window.DingTalkPC.device', window.DingTalkPC.device);
      console.log('window.DingTalkPC.device', window.DingTalkPC.util);

      return window.DingTalkPC.biz.util.openLink({
        "url": url,
        onSuccess: function (result) { },
        onFail: function (error) { }
      });


    } else {
      return window.open(url)
    }
  };

  /**
   * @param url 请求地址
   * @param params 请求所带参数 get请求会把参数附加到url上 不需要传参则填空对象 {}
   * @param emulateJSON 是否启用json 如启用，数据以json形式提交，不启用则填false
   * @param callback 回调函数
   */
  window.httpGet = function (url, params, emulateJSON, callback, error) {
    var _encodeParams = encodeParams(params);
    _encodeParams && (url += url.indexOf('?') != -1 ? "&" : "?" + _encodeParams);
    common_http('get', url, {}, false, callback, error)
  }

  /**
   * @param url 请求地址
   * @param params 请求所带参数 不需要传参则填空对象 {}
   * @param emulateJSON 是否启用json  如启用，数据以json形式提交,启用则填false
   * @param callback 回调函数
   */
  window.httpPost = function (url, params, emulateJSON, callback, error) {
    common_http('post', url, params, emulateJSON, callback, error)
  }

  window.common_http = function (method, url, params, emulateJSON, callback, error) {
    ajax_instance(method, url, params, emulateJSON, callback, error);
  }

  function ajax_instance(method, url, params, emulateJSON, callback, error) {
    var contentType = "application/x-www-form-urlencoded";

    if (emulateJSON) {
      contentType = "application/json";
      params = JSON.stringify(params);
    }

    var random = '_t=' + (Math.random() * 100000 >> 0)
    url = url + (url.indexOf("?") >= 0 ? '&' : '?') + random;

    $.ajax({
      type: method,
      url: url,
      data: params,
      contentType: contentType,
      success: function (data, status, jqXHR) {
        var res = data;
        try {
          if (typeof data == 'string') res = JSON.parse(data);
        } catch (e) {
          console.log(e);
        }
        callback && typeof callback == 'function' && callback(res);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        error && typeof error == 'function' && error(XMLHttpRequest, textStatus, errorThrown);
      }
    });
  }

  function encodeParams(params) {
    var str = "";
    if (typeof params == 'string') return params;

    if (Object.keys(params).length > 0) {
      for (var name in params) {
        var value = params[name];
        if (Array.isArray(value)) {
          value.forEach(function (item) {
            str += "&" + encodeURIComponent(name + "[]") + "=" + encodeURIComponent(item);
          });
        } else {
          str += "&" + name + "=" + encodeURIComponent(value);
        }
      }
      str = str.substring(1);
    }
    return str;
  }

  window.common_http_encodeParams = encodeParams;

  window.send_ding_message = function (users, text) {
    if (!window.DingTalkPC) return;
    window.DingTalkPC.biz.ding.post({
      users: users,//用户列表，userid
      corpId: window._global_data_corpId, //加密的企业id
      type: 1, //钉类型 1：image  2：link
      alertType: 2,
      alertDate: { "format": "yyyy-MM-dd HH:mm", "value": "" },
      attachment: {
        images: [''], //只取第一个image
      }, //附件信息
      text: text, //消息体
      onSuccess: function () { },
      onFail: function () { }
    })
  }

  window.send_link_ding_message = function (users, text, id) {
    if (!window.DingTalkPC) return;

    var url = window.location.origin + '/v_open/jump';
    var query = '?dd_nav_bgcolor=ff00ac9&type=1&id=' + id + '&corpId=' + window._global_data_corpId;
    url = url + query;
    var bodyText = '您有一个工单（' + text + '）需要关注';
    window.DingTalkPC.biz.ding.post({
      users: users, //用户列表，userid
      corpId: window._global_data_corpId, //企业id
      type: 2, //钉类型 1：image  2：link
      alertType: 2,
      alertDate: { "format": "yyyy-MM-dd HH:mm", "value": "" },
      attachment: {
        title: '工单信息（仅支持移动端查看）', //附件的标题
        url: url, //附件点击后跳转url
        image: window.location.origin + '/resource/images/att.png', //附件显示时的图片 【可选】
        text: text //附件显示时的消息体 【可选】
      },
      text: bodyText, //消息体
      onSuccess: function () { },
      onFail: function () { }
    })
  }

  window.send_ding_part_message = function (users, approveNo) {
    if (!window.DingTalkPC) return;

    var url = window.location.origin + '/v_open/jump';
    var query = '?dd_nav_bgcolor=ff00ac9&type=4&corpId=' + window._global_data_corpId;
    var route = '&route=/spareParts/myJob/detail?approveNo=' + approveNo
    url = url + query + route;
    var bodyText = `您有一个备件办理(${approveNo})需要关注`;
    window.DingTalkPC.biz.ding.post({
      users: users, //用户列表，userid
      corpId: window._global_data_corpId, //企业id
      type: 2, //钉类型 1：image  2：link
      alertType: 2,
      alertDate: { "format": "yyyy-MM-dd HH:mm", "value": "" },
      attachment: {
        title: '办理信息（仅支持移动端查看）', //附件的标题
        url: url, //附件点击后跳转url
        image: window.location.origin + '/resource/images/att.png', //附件显示时的图片 【可选】
        text: '办理信息（仅支持移动端查看）' //附件显示时的消息体 【可选】
      },
      text: bodyText, //消息体
      onSuccess: function () { },
      onFail: function () { }
    })
  }



  window.openHelp = function (url) {
    if (window.DingTalkPC && window.DingTalkPC.ua.isDesktop) {
      window.DingTalkPC.biz.util.openLink({
        "url": url,
        onSuccess: function (result) { },
        onFail: function (error) { }
      });
    } else {
      window.open(url);
    }
  }

  window.toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "2000",
    "extendedTimeOut": "0",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
  };

  // 提示
  window.toast = function (message, type) {
    let types = ['warning', 'error', 'success', 'info'];

    if (types.indexOf(type) <= -1) type = 'info';

    window.toastr[type](message);
  }

})();