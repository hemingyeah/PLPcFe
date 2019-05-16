import './BaseWindow.scss';
import Vue from 'Vue'
import BaseWindowOptions from './BaseWindow';

const BaseWindow = Vue.extend(BaseWindowOptions);

function parseOptions(o){
  return {
    title: o.title,
    show: true
  }
}

function createWindow(o = {}){
  let options = parseOptions(o)
  let dom = document.createElement('div');
  let parent = document.body;
  parent.appendChild(dom);

  let instance = new BaseWindow({
    propsData: options
  })

  instance.$mount(dom);
}


BaseWindowOptions.install = function(Vue){
  Vue.component(BaseWindowOptions.name, BaseWindowOptions);
  Vue.prototype.$createWindow = createWindow;
}

export default BaseWindowOptions;