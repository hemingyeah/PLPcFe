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