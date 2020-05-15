import * as Lang from '@src/util/lang';
import PopupManager from '../../util/PopupManager';

/**
 * 返回宽度大小（px）
 * @param {string} width - 宽度
 */
function parseWidth(width){
  return parseInt(width.replace('px', ''))
}

const BaseWindow = {
  name: 'base-window',
  props: {
    /** 是否显示组件 */
    show: Boolean,
    title: {
      type: String,
      default: 'title'
    }
  },
  data(){
    return {
      id: `window-${Lang.randomString(4)}-${Lang.randomString(4)}`,
      zIndex: PopupManager.topZIndex,

      $position: {
        top: 100,
        left: null,
        clientX: 0,
        clientY: 0
      }
    }
  },
  methods: {
    closed() {
      // 关闭动画结束时触发
      this.$emit('closed'); 
    },
    cancel(){
      this.$emit('cancel');
      this.close()
    },
    close(){
      // 关闭时触发
      this.$emit('close');
      // 兼容sync
      this.$emit('update:show', false);
      this.fullscreen = false;
    },
    stickTop(){
      if(this.zIndex < PopupManager.zIndex){
        this.zIndex = PopupManager.stickTop(this)
      }
    },
    toggleFullscreen(){
      this.fullscreen = !this.fullscreen;
    },
    computePosition(x, y){
      let position = this.$data.$position;

      let left = Math.floor(position.left + x - position.clientX);
      let top = Math.floor(position.top + y - position.clientY);

      return {left, top}
    },
    /** 初始化模态框拖拽所需参数 */
    initDrag(event){
      if(event.button != 0 || this.fullscreen) return;
  
      let position = this.$data.$position;
  
      position.clientX = event.clientX;
      position.clientY = event.clientY;
  
      document.addEventListener('mousemove', this.dragging)
      document.addEventListener('mouseup', this.endDrag)
    },
    dragging(event){
      let {left, top} = this.computePosition(event.clientX, event.clientY)

      this.$el.style.left = `${left}px`;
      this.$el.style.top = `${top}px`;
    },
    /** 保存拖拽结构，清空事件 */
    endDrag(event){     
      let {left, top} = this.computePosition(event.clientX, event.clientY);
      let position = this.$data.$position; 

      this.$el.style.left = `${left}px`;
      this.$el.style.top = `${top}px`;
      
      position.left = left;
      position.top = top;

      document.removeEventListener('mousemove', this.dragging)
      document.removeEventListener('mouseup', this.endDrag)
    },
    renderHeader(){
      return (
        <div class="base-window-header" ref="header" onMousedown={this.initDrag} onDblclick={this.toggleFullscreen}>
          <i class="iconfont icon-layer base-window-favicon"></i>
          <h3>{ this.title }</h3>
          <button type="button" class="base-window-menu" title="全屏" onClick={this.toggleFullscreen}>
            <i class="iconfont icon-max"></i>
          </button>
          <button type="button" class="base-window-menu base-window-close" title="关闭" onClick={this.cancel}>
            <i class="iconfont icon-guanbi"></i>
          </button>
        </div>
      );
    },
    renderWindow(){
      if(!this.show) return null;

      let width = parseWidth('800px');
      let position = this.$data.$position;
      if(position.left === null) {
        position.left = Math.floor((window.innerWidth - width) / 2);
      }

      const style = {
        width: `${width}px`, 
        maxHeight: this.maxHeight,
        zIndex: this.zIndex,
        top: `${position.top}px`,
        left: `${position.left}px`
      };

      const className = ['base-window', this.fullscreen ? 'base-window-fullscreen' : null]
      
      return (
        <div id={this.id} class={className} style={style} onMousedown={this.stickTop}>
          { this.renderHeader() }
          <div class="base-window-body">
            <iframe src="https://www.baidu.com" height="600px" width="100%"/>
          </div>
          {/* { this.renderFooter() } */}
        </div>
      );
    }
  },
  render(){
    return (
      <transition name="zoom" onAfterLeave={this.closed}>
        {this.renderWindow()}
      </transition>
    )
  }
}

export default BaseWindow;