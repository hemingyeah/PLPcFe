/** 只能在frame中引用 @author dongls */

function getRootWindow(win) {
  //非frame 环境
  if(win === window.top) return win;

  if(win.parent.__root_window_ == 'root') return win.parent;
  return getRootWindow(win.parent);
}

export default {
  created(){
    if(window == window.top) return;
    
    let rootWindow = getRootWindow(window)
    if(null != rootWindow){
      window.addEventListener('unload', function(){
        let frame = window.frameElement;
        let data = {
          action: 'shb.system.realodFrameById',
          id: frame.dataset.id
        }
        rootWindow.postMessage(data, window.location.origin)
      })
    }
  }
}