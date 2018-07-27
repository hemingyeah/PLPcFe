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
export function fromHtml(html = ''){
  if(null == tempEl){
    tempEl = document.createElement('div')
  }

  tempEl.innerHTML = html.trim();
  return tempEl.childNodes[0];
}

/** 获取滚动条的宽度 */
export function scrollBarWidth(){  
  let el = document.createElement('div');

  let styles = {
    width: '100px',
    height: '100px',
    overflowY: 'scroll'
  };

  for (let i in styles) el.style[i] = styles[i];

  document.body.appendChild(el);
  let scrollbarWidth = el.offsetWidth - el.clientWidth;
  el.remove();

  //下次直接返回结果
  scrollBarWidth = function(){ //eslint-disable-line
    return scrollbarWidth;
  }

  return scrollbarWidth;
}