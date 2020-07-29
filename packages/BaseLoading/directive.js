import Vue from 'vue';
import BaseLoading from './BaseLoading.vue';

const BaseLoadingConstructor = Vue.extend(BaseLoading);

export default {
  bind: function(el, binding, vnode){
    const text = el.getAttribute('loading-text');

    const instance = new BaseLoadingConstructor({
      el: document.createElement('div'),
      propsData: {
        text,
        visible: false
      }
    });

    el.appendChild(instance.$el)
    //instance.visible = true
  }
}