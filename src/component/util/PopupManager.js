let zIndex = 1000;

class PopupManager {
  constructor(){
    this.instances = [];
    this.handleEscape = e => this.closeTopPopup(e);

    // 监听键盘事件
    document.addEventListener('keydown', this.handleEscape, true);
  }

  get zIndex(){
    return zIndex;
  }

  get topZIndex(){
    return ++zIndex;
  }

  /** 
   * 注册一个组件，并返回topZIndex
   * @param {object} instance - 组件
   * @returns {number} topZIndex
   */
  register(instance){
    if(this.instances.indexOf(instance) >= 0) return this.stickTop(instance)
    
    this.instances.push(instance);
    return this.topZIndex;
  }

  remove(instance){
    let index = this.instances.indexOf(instance);
    if(index >= 0){
      this.instances.splice(index, 1)
    }
  }

  /** 置顶 */
  stickTop(instance){
    let index = this.instances.indexOf(instance)
    let last = this.instances.length - 1;

    // 和最后一个元素交换
    if(index < last){
      this.instances[index] = this.instances[last]
      this.instances[last] = instance;
    }
    
    return this.topZIndex;
  }

  closeTopPopup(event){
    if(event.key.toLowerCase() != 'escape') return;

    let last = this.instances.length - 1;
    let instance = this.instances[last];

    if(instance) instance.close();
  }
}


export default new PopupManager;