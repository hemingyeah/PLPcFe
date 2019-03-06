import * as dom from '@src/util/dom';
import Popper from 'popper.js';

export default class Tooltip{
  constructor(option = {}){
    this.el = null;
    this.popper = null;
    this.option = option;
    this.timer = null;
    this.delay = option.delay || 150;
    
    this.mouseenterHandler = () => this.clearTimer();
    this.mouseleaveHandler = () => this.destroy()
  }

  updateOption(option = {}){
    this.option = option;
  }

  show(){
    let option = this.option;
    if(!option.content) return;

    if(this.timer) this.clearTimer()

    if(null == this.el){
      let container = dom.fromHtml(this.genTemplate(option));
      container.addEventListener('mouseenter', this.mouseenterHandler)
      container.addEventListener('mouseleave', this.mouseleaveHandler)

      this.el = document.body.appendChild(container);
    }

    if(null == this.popper){
      this.popper = new Popper(option.target, this.el, {
        placement: option.placement,
        removeOnDestroy: true
      });
    }
  }

  /** 清空定时器 */
  clearTimer(){
    clearTimeout(this.timer)
    this.timer = null;
  }

  /** 隐藏tooltip */
  hide(){
    this.timer = setTimeout(() => this.destroy(), this.delay)
  } 

  /** 销毁tooltip */
  destroy(){
    if(null != this.popper){
      this.popper.destroy();
      this.popper = null;
    }

    if(this.el){
      this.el.removeEventListener('mouseenter', this.mouseenterHandler)
      this.el.removeEventListener('mouseleave', this.mouseleaveHandler)
      this.el = null;
    }
  }
    
  genTemplate(option){
    return `
      <div class="base-tooltip">
        <div class="base-tooltip-content">${option.content}</div>
        <div class="base-tooltip__arrow" x-arrow></div>
      </div>
    `;
  }
}