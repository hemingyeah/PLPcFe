import Vue from 'vue';
import BaseMapDisplay from './BaseMapDisplay.vue';
import * as dom from '@src/util/dom'

const BaseMapDisplayComp = Vue.extend(BaseMapDisplay);

/**
 *
 * @param {*} address
 * @param {*} options
 */
function display(address, options = {}){
  // let defaultArea = options.defaultArea;
  
  let instance = new BaseMapDisplayComp({
    propsData: {
      address: address,
      options,
    }
  });
  
  return new Promise((resolve, reject) => {
    let ele = document.createElement("div");
    let body = document.body;
    let pending = false;
    
    instance.$on('destroy', () => {
      setTimeout(() => dom.destroyComponent(instance), 150);
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
  namespace: 'map',
  props: {
    display
  }
}

export default MapDisplay;