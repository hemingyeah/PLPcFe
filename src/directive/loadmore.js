/**
 * 当滚动到离底部一定距离时，触发回调.
 * 可用于无限滚动
 * @author dongls 
 */

import * as Lang from '../util/lang/index'

function handler(event){
  let option = this._loadmore_option;
  if(option.disabled) return;

  let distance = option.distance;
  let callback = option.callback;

  let target = event.target;
  // 暂未处理滚动的方向性
  let MaxScrollHeight = target.scrollHeight - target.offsetHeight;
  // 未达到触发距离
  if(MaxScrollHeight - target.scrollTop >= distance) return;

  typeof callback == 'function' && callback(event);
}

const directive = {
  bind(el, binding, vnode){
    let option = binding.value || {};

    // 处理触发loadmore的距离
    if(!Lang.isSafeNumber(option.distance)) option.distance = 300;
    
    el._loadmore_option = option;
    el.addEventListener('scroll', handler, {passive: true})
  },
  unbind(el){
    el.removeEventListener('scroll', handler)
  }
};

export default directive;