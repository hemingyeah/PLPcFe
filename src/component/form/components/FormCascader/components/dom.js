let util = {};

/**
 * 获取滚动条的宽度
 */
util.scrollBarWidth = function(){  
  let el = document.createElement('p')
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
  util.scrollBarWidth = function(){
    return scrollbarWidth;
  }

  return scrollbarWidth;
}

export default util;