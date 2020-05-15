import BaseTabBar from './BaseTabBar.vue';

BaseTabBar.install = function(Vue){
  Vue.component(BaseTabBar.name, BaseTabBar);
};


export default BaseTabBar;
