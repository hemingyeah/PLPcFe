import './index.scss'

import { getReferenceEl } from './util';
import { fastCall } from '@src/component/util'

import Vue from 'vue';
import BizTeamSelect from './BizTeamSelect';

const BizTeamSelectComp = Vue.extend(BizTeamSelect);
/**
 * 选择团队
 * @param {Object} options - 配置项
 * @param {String} options.reference - 定位点，可以为元素选择器，或者dom对象
 * @param {String} options.parent - 父元素，不指定默认为document.body。可以为dom对象，选择器
 * @param {String} options.id - 组件内置输入框的id
 * @param {String} options.name - 组件内置输入框的 name
 * @param {String} options.placeholder - 提示
 * @param {String} options.multiple - 是否多选
 * @param {String} options.value - 组件的值
 * @param {String} options.collapse - 是否折叠tag
 * @param {Function} options.fetchFunc - 数据源
 * @param {Function} options.serializer - 数据序列化方法，用于表单形式提交
 * @param {Boolean} options.popperOptions - popper.js的配置项
 * @returns {VueComponent} 返回组件实例
 */
function initTeamSelect(options = {}){
  // 获取定位元素
  let refEl = getReferenceEl(options.reference);
  if(null == refEl) return console.error(`[${BizTeamSelect.name}]: need a reference element.`);
  if(!document.body.contains(refEl)) return console.error(`[${BizTeamSelect.name}]: reference element must be in document`);

  let className = refEl.className ? refEl.className.split(' ') : [];
  if(Array.isArray(options.className)) className = options.className;

  // 创建实例
  let instance = new BizTeamSelectComp({
    propsData: {
      className,
      placeholder: options.placeholder || refEl.placeholder,
      parent: options.parent,
      id: options.id || refEl.id,
      name: options.name || refEl.name,
      multiple: options.multiple,
      value: options.value,
      collapse: options.collapse,
      disabled: options.disabled,
      fetchFunc: options.fetchFunc,
      serializer: options.serializer,
      popperClassName: options.popperClassName,
      popperOptions: Object.freeze(options.popperOptions || {})
    }
  });
  
  instance.$mount(refEl);

  return instance;
}

const component = {
  install(Vue){
    Vue.component(BizTeamSelect.name, BizTeamSelect);
    // 注册快速调用方法
    fastCall(Vue, 'biz', {initTeamSelect})
  },
  namespace: 'biz',
  props: { initTeamSelect }
}

export default component;