import Vue from 'vue';
import Department from './Department.vue';
import * as dom from '@src/util/dom';

const DeptComponent = Vue.extend(Department);
const MAX_NUM = 150; //单次选人上限

function choose(type = 'dept', options = {}){
  if(type == 'dept') return dept(options);
}

function dept(options){
  //处理传入参数
  let selectedUser = [];
  let max = 0;

  if(typeof options.max == 'number' && !isNaN(max) && isFinite(max)) max = parseInt(options.max);
  if(max <= 0 || max > MAX_NUM) max = MAX_NUM; //单次上限是150个
  if(max > 1 && Array.isArray(options.selected)) {
    selectedUser = options.selected.length > max ? options.selected.slice(0, max) : options.selected;
  }

  let showLocation = !!options.allotMap;
  let action = '/security/department/user';
  if(showLocation || options.allot) action = '/task/department/user/dispatch/list';
  if(options.action) action = options.action;

  let instance = new DeptComponent({
    propsData: {
      title: options.title,
      selectedUser,
      max,
      showTaskCount: options.showTaskCount === true,
      showUserState: options.showUserState === true,
      showLocation, //是否显示定位信息
      lat: options.lat,
      lng: options.lng,
      action,
      showDeptCheckbox: options.showDeptCheckbox === true
    }
  });

  let ele = document.createElement("div");
  let body = document.body;
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

    body.appendChild(ele);
    instance.$mount(ele);
  })
}

const BaseContact = {
  namespace: 'contact',
  props: {
    choose
  }
};

export default BaseContact;