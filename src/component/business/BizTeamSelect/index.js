import './index.scss'

import * as util from './util';

import Vue from 'vue';
import BizTeamSelect from './BizTeamSelect';

const BizTeamSelectComp = Vue.extend(BizTeamSelect);
/**
 * 选择团队
 * @param {Object} options - 配置项
 * @param {String} options.reference - 定位点，可以为元素选择器，或者dom对象
 * @param {String} options.parent - 父元素，不指定默认为document.body。可以为dom对象，选择器
 * @returns {VueComponent} 返回组件实例
 */
function initTeamSelect(options = {}){
  // 获取定位元素
  let refEl = util.getReferenceEl(options.reference);
  if(null == refEl) return console.error(`[${BizTeamSelect.name}]: need a reference element.`);
  if(!document.body.contains(refEl)) return console.error(`[${BizTeamSelect.name}]: reference element must be in document`);

  let className = refEl.className ? refEl.className.split(' ') : [];
  if(Array.isArray(options.className)) className = options.className

  // 创建实例
  let instance = new BizTeamSelectComp({
    propsData: {
      className,
      placeholder: options.placeholder || refEl.placeholder,
      parent: options.parent,
      id: options.id || refEl.id,
      multiple: options.multiple,
      initValue: options.value,
    }
  });
  
  instance.$mount(refEl);

  return instance;

  // return new Promise((resolve, reject) => {
  //   instance.$on('destroy', () => {
  //     // 先销毁popper
  //     if(instance.$data.$popper) {
  //       // 销毁popper时会删除dom，所以不再手动删除
  //       instance.$data.$popper.destroy()
  //     }

  //     // 再销毁组件
  //     instance.$destroy(true);
  //     instance = null;

  //     // 清除biz-id
  //     delete refEl.dataset.bizId;

  //     //reject({status: 1, message: 'cancel'})
  //   });

  //   instance.$on('input', value => {
  //     resolve({status: 0, data: value});
  //   })

  //   instance.init();
  // })
}


const component = {
  install(Vue){
    Vue.component(BizTeamSelect.name, BizTeamSelect);
  },
  component: BizTeamSelect,
  namespace: 'biz',
  props: { initTeamSelect }
}

export default component;