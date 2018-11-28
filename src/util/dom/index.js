//公用dom, 使用前请确保清空内容
//禁止插入文档中，禁止添加或修改属性，如有需要自行创建dom
let tempEl = null;

/** 动态加载一个js, 返回一个Promise */
export function importScript(url) {
  return new Promise(function (resolve, reject) {
    var script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);

    script.onload = () => resolve();
    script.onerror = error => reject(error);
  });
}

/** 从html创建一个dom */
export function fromHtml(html = '') {
  if (null == tempEl) {
    tempEl = document.createElement('div')
  }

  tempEl.innerHTML = html.trim();
  return tempEl.childNodes[0];
}

/** 获取滚动条的宽度 */
export function scrollBarWidth() {
  let el = document.createElement('div');

  let styles = {
    width: '100px',
    height: '100px',
    overflowY: 'scroll'
  };

  for (let i in styles) el.style[i] = styles[i];

  document.body.appendChild(el);
  let scrollbarWidth = el.offsetWidth - el.clientWidth;

  document.body.removeChild(el);
  el = null;

  //下次直接返回结果
  scrollBarWidth = function () { //eslint-disable-line
    return scrollbarWidth;
  }

  return scrollbarWidth;
}

/** 反转义html */
export function decodeHTML(text) {
  if (null == tempEl) {
    tempEl = document.createElement('div')
  }

  tempEl.innerHTML = text;
  return tempEl.innerText || tempEl.textContent;
}

/** 
 * 将元素全屏
 * 注：frame需要加allowfullscreen属性
 * @see https://developer.mozilla.org/zh-CN/docs/Web/API/Element/requestFullScreen
 */
export function fullScreen(dom) {
  if(!(dom instanceof Element)) return;

  if(dom.requestFullscreen) return dom.requestFullScreen();
  if(dom.webkitRequestFullScreen) return dom.webkitRequestFullScreen();
  if(dom.mozRequestFullScreen) return dom.mozRequestFullScreen();
  if(dom.msRequestFullscreen) return dom.msRequestFullscreen();
  
  return alert('您的浏览器不支持全屏，请升级您的浏览器');
}

/** 销毁组件实例 */
export function destroyComponent(instance){
  let el = instance.$el;
  let parent = el.parentNode;

  instance.$destroy(true);
  instance = null;
  parent.removeChild(el); 
}

/**
 * 用于获取顶层window
 * 顶层window中添加了一个特殊属性[__root_window_],因此判断该属性即可
 * 
 * 注：不适合使用惰性函数改写
 * 
 * @param win - 当前窗口window对象
 */
export function getRootWindow(win) {
  //非frame 环境
  if(win === window.top) return win;

  if(win.parent.__root_window_ == 'root') return win.parent;
  return getRootWindow(win.parent);
}

export function hasClass(el, cls) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}

export function trim(string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
}

export function removeClass(el, cls) {
  if (!el || !cls) return;
  var classes = cls.split(' ');
  var curClass = ' ' + el.className + ' ';
  
  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;
    
    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(' ' + clsName + ' ', ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

export function addClass(el, cls) {
  if (!el) return;
  var curClass = el.className;
  var classes = (cls || '').split(' ');
  
  for (var i = 0, j = classes.length; i < j; i++) {
    var clsName = classes[i];
    if (!clsName) continue;
    
    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += ' ' + clsName;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

export function getStyle(el, styleProp) {
  var value, defaultView = (el.ownerDocument || document).defaultView;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hyphen separated words eg. font-Size)
    styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    styleProp = styleProp.replace(/\-(\w)/g, function (str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[styleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
      return (function (value) {
        var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        value = el.style.pixelLeft + "px";
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return value;
      })(value);
    }
    return value;
  }
}
