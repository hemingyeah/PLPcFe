
/**
 * 是否为IE
 */
function isIE () {
  return window.hasOwnProperty('ActiveXObject')
}

/**
* 请求全屏
*/
export function requestFullScreen() {
  // IE
  if (isIE()) {
    let wScript = new window.ActiveXObject('WScript.Shell')
    // eslint-disable-next-line new-cap
    wScript && wScript.SendKeys('{F11}')
    return
  }
  // normal browser
  let cacheElm = document.documentElement;
  let reqFull = cacheElm.requestFullScreen || cacheElm.webkitRequestFullScreen || cacheElm.mozRequestFullScreen || cacheElm.msRequestFullScreen
  reqFull && reqFull.call(cacheElm)
}

/**
* 取消全屏
*/
export function cancelFullScreen () {
  if (isIE()) {
    let wScript = new window.ActiveXObject('WScript.Shell')
    // eslint-disable-next-line new-cap
    wScript && wScript.SendKeys('{F11}')
    return
  }
  let cacheElm = document;
  let cancelFull = cacheElm.cancelFullScreen || cacheElm.webkitCancelFullScreen || cacheElm.mozCancelFullScreen || cacheElm.exitFullScreen;

  cancelFull && cancelFull.call(cacheElm);

}

export function isFullScreen () {
  return document.isFullScreen || document.mozFullScreen || document.mozIsFullScreen || document.webkitIsFullScreen;
}


export function formatNumberSplit(number = 0, range = 3) {
  let result = '';
  let numStr = '';
  let suffix = '';

  if (number % 1) { // 是小数
    let subs = number.toString().split('.');
    numStr = subs[0];
    suffix = `.${subs[1]}`;
  } else { // 整数
    numStr = number.toString();
  }

  while (numStr.length > range) {
    result = `,${numStr.slice(-range)}${result}`;
    numStr = numStr.slice(0, numStr.length - range);
  }

  if (numStr) result = numStr + result;

  return result + suffix;
}

