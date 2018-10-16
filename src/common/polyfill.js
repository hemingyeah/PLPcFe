/** 全局polyfill @author dongls */
import "babel-polyfill";

if (!Element.prototype.matches) {
  Element.prototype.matches =
    Element.prototype.matchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    Element.prototype.webkitMatchesSelector
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function (s) {
    var el = this;
    if (!document.documentElement.contains(el)) return null;
    do {
      if (el.matches(s)) return el;
      el = el.parentElement;
    } while (el !== null);
    return null;
  };
}

// CustomEvent polyfill
(function () {
  if (typeof window.CustomEvent === "function") return false;
  function CustomEvent(event, params) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

//click handler
(function(){
  //非顶层window
  let rootWindow = getRootWindow(window);
  if(window != rootWindow){
    //传递点击事件，用于关闭popper
    document.addEventListener('click', function(e){
      rootWindow.document.body.click();
    })
  }

  function getRootWindow(win) {
    //非frame 环境
    if(win === window.top) return win;
  
    if(win.parent.__root_window_ == 'root') return win.parent;
    return getRootWindow(win.parent);
  }
})()