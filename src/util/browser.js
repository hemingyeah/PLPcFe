// 获取浏览器类型和版本号
const explore = (function() {
  let Sys = {};  
  let ua = navigator.userAgent.toLowerCase();
  let browserInfo = {};

  if(ua.match(/msie ([\d.]+)/)) {
    Sys.ie = ua.match(/msie ([\d.]+)/)[1];
  } else if(ua.match(/rv:([\d.]+)\) like gecko/)) {
    Sys.ie = ua.match(/rv:([\d.]+)\) like gecko/)[1];
  } else if(ua.match(/edge\/([\d.]+)/)) {
    Sys.edge = ua.match(/edge\/([\d.]+)/)[1];
  } else if(ua.match(/firefox\/([\d.]+)/)) {
    Sys.firefox = ua.match(/firefox\/([\d.]+)/)[1];
  } else if(ua.match(/(?:opera|opr).([\d.]+)/)) {
    Sys.opera = ua.match(/(?:opera|opr).([\d.]+)/)[1];
  } else if(ua.match(/chrome\/([\d.]+)/)) {
    Sys.chrome = ua.match(/chrome\/([\d.]+)/)[1];
  } else if(ua.match(/version\/([\d.]+).*safari/)) {
    Sys.safari = ua.match(/version\/([\d.]+).*safari/)[1];
  } else {
    Sys.other = null;
  }
  // (s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1]
  //   : (s = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = s[1]
  //     : (s = ua.match(/edge\/([\d.]+)/)) ? Sys.edge = s[1]  
  //       : (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1]    
  //         : (s = ua.match(/(?:opera|opr).([\d.]+)/)) ? Sys.opera = s[1]
  //           : (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1]  
  //             : (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] 
  //               : Sys.other = null;

  browserInfo.type = Object.keys(Sys).toString();
  browserInfo.version = Object.values(Sys).toString();

  return browserInfo;
})()

// 判断是否在钉钉中
const isDingTalk = (function() {
  let ua = navigator.userAgent.toLowerCase();

  return ua.indexOf('dingtalk') >= 0
})()

// 获取操作系统类型
const os = (function() {
  let isWin = (navigator.platform == 'Win32') || (navigator.platform == 'Windows');
  let isMac = (navigator.platform == 'Mac68K') || (navigator.platform == 'MacPPC') || (navigator.platform == 'Macintosh') || (navigator.platform == 'MacIntel');
  let isUnix = (navigator.platform == 'X11') && !isWin && !isMac;
  let isLinux = (String(navigator.platform).indexOf('Linux') > -1);
  let os;

  if(isWin) {
    os = 'Windows';
  } else if(isMac) {
    os = 'MacOS';
  } else if(isUnix) {
    os = 'Unix';
  } else if(isLinux) {
    os = 'Linux';
  } else {
    os = 'other';
  }
  
  return os;

})()

function isIe() {
  return explore.type == 'ie';
}

function isFirefox() {
  return explore.type == 'firefox';
}

function isChrome() {
  return explore.type == 'chrome';
}

function isSafari() {
  return explore.type == 'safari';
}

const browser = {
  ...explore,
  os,
  isDingTalk,
  isIe: isIe(),
  isFirefox: isFirefox(),
  isChrome: isChrome(),
  isSafari: isSafari()
};

export default browser;
