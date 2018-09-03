import Vue from 'vue';
import Dept from './Dept.vue';

const DeptComponent = Vue.extend(Dept);

function choose(type = 'dept', options = {}){
  if(type == 'dept') return dept(options);
}

function dept(options){
  //处理传入参数
  let selectedUser = [];
  let max = 0;

  if(typeof options.max == 'number' && !isNaN(max) && isFinite(max)) max = parseInt(options.max);
  if(max > 1 && Array.isArray(options.selected)) {
    selectedUser = options.selected.length > max ? options.selected.slice(0, max) : options.selected;
  }

  let instance = new DeptComponent({
    propsData: {
      title: options.title,
      selectedUser,
      max,
    }
  });
  let ele = document.createElement("div");
  let body = document.body;
  let pending = true;

  return new Promise((resolve, reject) => {
    instance.$on('destroy', event => {
      setTimeout(() => destory(instance), 1500);
    })

    instance.$on('choose', user => {
      if(pending) return;

      pending = true;
      resolve(user);
    });
    
    instance.$on('cancel', () => {
      if(pending) return;
      
      pending = true;
      reject('cancel')
    })

    body.appendChild(ele);
    instance.$mount(ele);
  })
}

/** 销毁组件 */
function destory(instance){
  let el = instance.$el;
  let parent = el.parentNode;

  instance.$destroy(true);
  instance = null;
  parent.removeChild(el); 
}

const BaseContact = {
  choose,
  install(Vue){
    if(!Vue.prototype.$fast) Vue.prototype.$fast = {};
    Vue.prototype.$fast.contact = BaseContact;
  }
};

export default BaseContact;