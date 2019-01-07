import Vue from 'vue';
import BaseSelectTeam from './BaseSelectTeam.vue';
import * as dom from '@src/util/dom';

const BaseSelectTeamComponent = Vue.extend(BaseSelectTeam);
const MAX_NUM = 150; //单次选人上限

function choose(type = 'team', options = {}){
  if(type == 'team') return team(options);
}

function team(options){
  //处理传入参数
  let action = '';
  let params = {};
  
  if(options.action) action = options.action;
  if(options.params) params = options.params;

  let instance = new BaseSelectTeamComponent({
    propsData: {
      placeholder: options.placeholder || '',
      action,
      params,
    }
  });

  let ele = document.createElement("div");
  let el = options.el || document.body;
  let pending = false;

  return new Promise((resolve, reject) => {
    instance.$on('destroy', event => {
      setTimeout(() => dom.destroyComponent(instance), 1500);
    })

    instance.$on('input', user => {
      if(pending) return;

      pending = true;
      resolve({status: 0, data: user});
    });
    
    instance.$on('cancel', () => {
      if(pending) return;

      pending = true;
      resolve({status: 1, message: 'cancel'});
    })

    el.appendChild(ele);
    instance.$mount(ele);
  })
}

function init() {

}

const BaseContact = {
  namespace: 'selectTeam',
  props: {
    choose,
    init
  }
};

export default BaseContact;