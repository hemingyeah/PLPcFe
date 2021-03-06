// 公用dom, 使用前请确保清空内容
// 禁止插入文档中，禁止添加或修改属性，如有需要自行创建dom
let tempEl = null;

/** 动态加载一个js, 返回一个Promise */
export function importScript(url) {
  return new Promise(function (resolve, reject) {
    let script = document.createElement('script');
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
export function getScrollBarWidth() {
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

  // 下次直接返回结果
  getScrollBarWidth = function () { //eslint-disable-line
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
  let copyInstance = instance;

  copyInstance.$destroy(true);
  copyInstance = null;
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
  // 非frame 环境
  if(win === window.top) return win;

  if(win.parent.__root_window_ == 'root') return win.parent;
  return getRootWindow(win.parent);
}

export function hasClass(el, cls) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) return el.classList.contains(cls);
    
  return (` ${ el.className } `).indexOf(` ${ cls } `) > -1;
}

export function trim(string) {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
}

export function removeClass(el, cls) {
  if (!el || !cls) return;
  let classes = cls.split(' ');
  let curClass = ` ${ el.className } `;
  
  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i];
    if (!clsName) continue;
    
    if (el.classList) {
      el.classList.remove(clsName);
    } else if (hasClass(el, clsName)) {
      curClass = curClass.replace(` ${ clsName } `, ' ');
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
}

export function addClass(el, cls) {
  if (!el) return;
  let curClass = el.className;
  let classes = (cls || '').split(' ');
  
  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i];
    if (!clsName) continue;
    
    if (el.classList) {
      el.classList.add(clsName);
    } else if (!hasClass(el, clsName)) {
      curClass += ` ${ clsName }`;
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
}

export function getStyle(el, styleProp) {
  let value, defaultView = (el.ownerDocument || document).defaultView;
  let copyStyleProp = styleProp;
  // W3C standard way:
  if (defaultView && defaultView.getComputedStyle) {
    // sanitize property name to css notation
    // (hyphen separated words eg. font-Size)
    copyStyleProp = copyStyleProp.replace(/([A-Z])/g, '-$1').toLowerCase();
    return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
  } else if (el.currentStyle) { // IE
    // sanitize property name to camelCase
    copyStyleProp = copyStyleProp.replace(/\-(\w)/g, function (str, letter) {
      return letter.toUpperCase();
    });
    value = el.currentStyle[copyStyleProp];
    // convert other units to pixels on IE
    if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
      return (function (value) {
        let oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
        let copyValue = value;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value || 0;
        copyValue = `${ el.style.pixelLeft }px`;
        el.style.left = oldLeft;
        el.runtimeStyle.left = oldRsLeft;
        return copyValue;
      })(value);
    }
    return value;
  }
}

export function getTextWidth() {
  // do some things...
}

export function createElement(tag, attrs){
  let element = document.createElement(tag);
  
  if(null != attrs){
    for(let prop in attrs) element[prop] = attrs[prop]
  }
  
  return element;
}