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