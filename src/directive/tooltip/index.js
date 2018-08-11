/** tooltip指令，替代原生浏览器title属性 @author dongls */
import './tooltip.scss';

import _ from 'lodash';
import Tooltip from './Tooltip';
import TooltipManager from './TooltipManager';

let manager = new TooltipManager();

function showToolTip(event){
  let el = event.target;
  let id = el.dataset.tooltip;
  let tooltip = manager.get(id);

  if(tooltip) tooltip.show();
}

function hideToolTip(event){
  let el = event.target;
  let id = el.dataset.tooltip;
  let tooltip = manager.get(id);

  if(tooltip) tooltip.hide();
}

/**
 * 获取tooltip的配置
 * 支持从dom元素的title上取值
 * 
 * @param {*} option 传入的配置
 * @param {*} el 
 * @param {*} insOption 当前配置，更新选项时用
 */
function parseOption(value, el, insOption = {}){
  //如果传入string类型值，该值会被当做conent
  if(typeof value != 'object') {
    value = value == null ? {} : {content: value}
  }
  //指令传入的选项  
  let option = _.assign({}, value, {target: el});
  //如果是新绑定的，指定id
  insOption.id = insOption.id || `tooltip-${Math.random() * 1000000 >> 0}-${Math.random() * 1000000 >> 0}`;
  
  //来自dom的参数
  let domOption = {
    content: el.title,
    placement: el.dataset.placement || 'bottom'
  }

  //删除tilte阻止浏览器默认行为
  el.removeAttribute('title');
  
  return _.assign({}, domOption, insOption, option)
}

const directive = {
  bind(el, bind){
    let option = parseOption(bind.value, el);
    //设置tooltipid，根据该id标记该实例
    el.dataset.tooltip = option.id;
    
    let tooltip = new Tooltip(option);
    manager.save(option.id, tooltip)

    el.addEventListener('mouseenter', showToolTip)
    el.addEventListener('mouseleave', hideToolTip)
  },
  update(el, bind){
    let id = el.dataset.tooltip;
    let tooltip = manager.get(id);
    let option = parseOption(bind.value, el, tooltip.option);
    
    tooltip.updateOption(option)
  },
  unbind(el){
    el.removeEventListener('mouseenter', showToolTip)
    el.removeEventListener('mouseleave', hideToolTip)
  }
};

export default directive;