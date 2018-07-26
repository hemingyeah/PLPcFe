/** tooltip指令，替代原生浏览器title属性 @author dongls */
import './tooltip.scss';

import Vue from 'vue';
import Popper from 'popper.js';
import TooltipManager from './TooltipManager';

let manager = new TooltipManager();

function showToolTip(event){
  let el = event.target;
  let id = el.dataset.tooltip;

  let {option, component} = manager.getContext(id);

  if(null == component){
    component = createTooltip(option)
    manager.saveComponent(id, component);
    component.init();
  }
}

function hideToolTip(event){
  let el = event.target;
  let id = el.dataset.tooltip;

  let {component} = manager.getContext(id);

  component.destroy();
  manager.removeComponent(id)
}

function createTooltip(option){
  return new Vue({
    data: {
      popper: null
    },
    render(){
      return (
        <div class="base-tooltip">
          {option.content}
          <div class="base-tooltip__arrow" x-arrow></div>
        </div>
      )
    },
    methods: {
      init(){
        let mountEl = document.createElement('div');
        document.body.appendChild(mountEl);

        this.$mount(mountEl);
        this.popper = new Popper(option.target, this.$el);
      },
      destroy(){
        this.popper.destroy()
      }
    }
  })
}

/**
 * 获取tooltip的配置
 * 支持从dom元素的title上取值
 * 
 * @param {*} option 传入的配置
 * @param {*} el 
 */
function getOption(option, el){
  //默认取title上的值
  let content = el.title;
  //删除tilte阻止浏览器默认行为
  el.removeAttribute('title');

  //如果传入string类型值，该值会被当做conent
  if(typeof option == 'string') content = option;

  if(typeof value == 'object'){
    if(option.content != null) content = option.content
  }
  
  return {
    content,
    target: el,
    id: `tooltip-${Math.random() * 1000000 >> 0}-${Math.random() * 1000000 >> 0}`
  };
}

export default {
  bind(el, bind, vnode){
    let option = getOption(bind.value, el);
    el.dataset.tooltip = option.id;
    manager.saveContext(option.id, {option})

    el.addEventListener('mouseenter', showToolTip)
    el.addEventListener('mouseleave', hideToolTip)
  },
  unbind(el){
    el.removeEventListener('mouseenter', showToolTip)
    el.removeEventListener('mouseleave', hideToolTip)
  }
};