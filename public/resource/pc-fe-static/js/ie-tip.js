window.onload = function(){
  var styNode = document.createElement("style");
  document.getElementsByTagName('head').item(0).appendChild(styNode); 
  styNode.styleSheet.cssText = '#ie-tip-box{box-sizing:border-box;position:absolute;top:120px;right:0;left:0;z-index:9999;margin:0 auto;padding:20px;width:582px;border:1px solid #f0f0f0;border-radius:4px;background-color:#fff;box-shadow:rgba(0,0,0,.15) 0 0 8px 0;font-size:14px}.ie-tip-close{float:right;width:40px;height:20px;color:#9c9c9c;text-align:center;line-height:20px;cursor:pointer;user-select:none}.ie-tip-title{margin:0 0 20px 0;color:#444;font-weight:500;line-height:20px}.browser-lists{overflow:hidden;margin:0;padding:0}.browser-lists li{float:left;width:180px;list-style:none}.browser-lists li a{color:#0072c6;text-decoration:none}.browser-lists li a img{float:left;margin-right:10px;width:34px;height:34px;border:0}.browser-lists li a span{display:block;font-size:12px;line-height:12px}';

  var dom = document.createElement('div');
  dom.innerHTML = "<div id='ie-tip-box'><p class='ie-tip-title'>您当前使用的浏览器版本过低，请升级您的浏览器：<span class='ie-tip-close' onclick='ieTipClose()'>关闭</span></p><ul class='browser-lists'><li><a href='http://www.google.cn/chrome/' target='_blank'><img src='/resource/pc-fe-static/img/chrome-logo.png' alt='谷歌浏览器'>谷歌浏览器<span>Google Chrome</span></a></li><li><a href='http://www.firefox.com.cn/download/' target='_blank'><img src='/resource/pc-fe-static/img/firefox-logo.png' alt='火狐浏览器'>火狐浏览器<span>Mozilla Firefox</span></a></li><li><a href='http://windows.microsoft.com/zh-cn/internet-explorer/download-ie' target='_blank'><img src='/resource/pc-fe-static/img/ie-logo.jpg' alt='IE浏览器'>IE浏览器<span>Internet Explorer</span></a></li></ul></div>";
  document.body.appendChild(dom);
}

function ieTipClose(){
  var node = document.getElementById("ie-tip-box").parentNode;
  document.body.removeChild(node)
}