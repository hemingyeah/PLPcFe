import * as dom from '@src/util/dom';
import Popper from 'popper.js'

export default class Tooltip{
  constructor(option = {}){
    this.el = null;
    this.popper = null;
    this.option = option;
    this.timer = null;
  }

  updateOption(option = {}){
    this.option = option;
  }

  show(){
    let option = this.option;
    if(!option.content) return;

    if(null == this.el){
      let container = dom.fromHtml(this.genTemplate(option));
      this.el = document.body.appendChild(container);
    }

    if(null == this.popper){
      this.popper = new Popper(option.target, this.el, {
        placement: option.placement,
        removeOnDestroy: true
      });
    }
  }

  hide(){
    this.destroy();
  }

  destroy(){
    if(null != this.popper){
      this.popper.destroy();
      this.popper = null;
    }

    this.el = null;
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