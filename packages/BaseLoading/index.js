import Vue from 'vue';
import BaseLoading from './BaseLoading.vue';

const BaseLoadingConstructor = Vue.extend(BaseLoading);

BaseLoadingConstructor.prototype.hide = function(){
  if(!this.visible) return;

  this.visible = false;
}

let activeInstances = [];

function destory(instance){
  let el = instance.$el;
  let parent = el.parentNode;

  instance.$destroy(true);
  parent.removeChild(el); 
}

//必须指定一个父容器
function show(target, options = {}){
  let parent = null;
  let text;

  if(target instanceof HTMLElement) parent = target;
  if(typeof target == 'string') parent = document.querySelector(target);
  
  if(null == parent) parent = document.body;
  if(options.text) text = options.text;

  let existInstance = findExistInstance(parent);
  if(null != existInstance) return existInstance;

  let instance = new BaseLoadingConstructor({
    el: document.createElement("div"),
    propsData: {
      text,
      visible: false
    }
  });

  instance.$on('destory', () => {
    let parent = instance.$el.parentNode;
    //清除父容器class
    parent.classList.remove('base-loading-target')
    //从已激活实例中删除该实例
    removeExistInstance(parent);

    setTimeout(() => destory(instance), 1500);
  });

  adjustTarget(parent)
  parent.appendChild(instance.$el);
  instance.$nextTick(() => instance.visible = true);

  activeInstances.push({
    target: parent,
    instance: instance
  })

  return instance;
}

function adjustTarget(target){
  target.classList.add('base-loading-target')
}

function findExistInstance(parent){
  for(let i = 0; i < activeInstances.length; i++){
    let o = activeInstances[i];
    if(o.target == parent) return o.instance;
  }

  return null;
}

function removeExistInstance(parent){
  let index = -1;

  for(let i = 0; i < activeInstances.length; i++){
    let o = activeInstances[i];
    if(o.target == parent) {
      index = i;
      break;
    }
  }

  index >= 0 && (activeInstances.splice(index, 1))
}

export default {
  show
}