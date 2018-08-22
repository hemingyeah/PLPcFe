import BasePanel from './BasePanel.vue';

BasePanel.install = function(Vue){
  Vue.component(BasePanel.name, BasePanel);
}

export default BasePanel;

