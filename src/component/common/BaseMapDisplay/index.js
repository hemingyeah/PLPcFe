import Vue from 'vue';
import BaseMapDisplay from './BaseMapDisplay.vue';

import { destroyComponent } from '@src/util/dom';
import fastCall from '@src/component/util/fastCall.ts';

const BaseMapDisplayComp = Vue.extend(BaseMapDisplay);

/**
 *
 * @param {Object} address 地址信息
 * @param {Object} options 配置
 * @param {String} markerDom 标记dom
 * @param {String} infoDom 相信信息dom
 * @param {Function} renderMarkFunc 自定义渲染mark方法
 */
function display(address, options = {}, markerDom, infoDom, renderMarkFunc){
  let instance = new BaseMapDisplayComp({
    propsData: {
      address,
      options,
      markerDom,
      infoDom,
      renderMarkFunc
    }
  });
  
  return new Promise((resolve, reject) => {
    let ele = document.createElement('div');
    let body = document.body;
    let pending = false;
    
    instance.$on('destroy', () => {
      setTimeout(() => destroyComponent(instance), 150);
    })
    
    instance.$on('input', event => {
      if(pending) return;
      
      this.pending = true;
      resolve({status: 0, data: event});
    })
    
    instance.$on('cancel', () => {
      if(pending) return;
      this.pending = true;
      resolve({status: 1, message: 'cancel'});
    })
    
    body.appendChild(ele);
    instance.$mount(ele);
  })
    .then(data => {
      let callback = options.callback;
      callback && typeof callback == 'function' && callback(data);
      return data;
    })
    .catch(err => console.error('err', err));
}

const MapDisplay = {
  install(Vue){
    fastCall(Vue, 'map', { display })
  },
}

export default MapDisplay;