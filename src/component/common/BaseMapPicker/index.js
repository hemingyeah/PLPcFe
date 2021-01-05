import Vue from 'vue';
import BaseMapPicker from './BaseMapPicker.vue';

import { destroyComponent } from '@src/util/dom';
import fastCall from '@src/component/util/fastCall.ts';

const BaseMapPickerComp = Vue.extend(BaseMapPicker);

/**
 * 
 * @param {*} address
 * @param {*} options 
 */
function picker(address, options = {}){
  let defaultArea = options.defaultArea;
  
  let instance = new BaseMapPickerComp({
    propsData: {
      address,
      defaultArea
    }
  });

  return new Promise((resolve, reject) => {
    let ele = document.createElement('div');
    let body = document.body;
    let pending = false;

    instance.$on('destroy', () => {
      setTimeout(() => destroyComponent(instance), 100);
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

const MapPicker = {
  install(Vue){
    fastCall(Vue, 'map', { picker })
  },
  namespace: 'map',
  props: {
    picker
  }
}

export default MapPicker;
