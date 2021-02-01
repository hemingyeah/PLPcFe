import Vue from 'vue';
import ElementUI from '@src/component/element-ui';
import platform from "@src/platform";

import BaseContact from '../../common/BaseContact';
import ProposeApproveDialog from "../../../modules/task/view/components/ProposeApproveDialog";

Vue.use(ElementUI);
Vue.use(BaseContact);

Vue.prototype.$platform = platform;


const BizProposeApproveDialog = Vue.extend(ProposeApproveDialog);

// 单例模式
let createSingleton = function(func) {
  let instance;
  return function() {
      return instance || (instance = func.apply(this,arguments));
  }
};

/**
 * 选择团队
 * @param {Object} options - 配置项
 * @param {String} options.remarkRequired 备注是否必填
 * @param {String} options.taskId 工单id
 */
function initProposeApproveDialog(options = {}){

  // 创建实例
  let instance = new BizProposeApproveDialog({
    propsData: {
        remarkRequired: options.remarkRequired || false,
        taskId: options.taskId
    }
  });

  let ele = document.createElement('div');
  let body = document.body;

  body.appendChild(ele);
  instance.$mount(ele);
  return instance;
}

const component = {
  install(Vue){
    Vue.component(ProposeApproveDialog.name, ProposeApproveDialog);
  },
  namespace: 'dialog',
  props: { 
    initProposeApproveDialog: createSingleton(initProposeApproveDialog) 
  }
}

export default component;