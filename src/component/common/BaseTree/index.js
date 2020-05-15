import BaseTree from './BaseTree.vue';

BaseTree.install = function(Vue){
  Vue.component(BaseTree.name, BaseTree);
}

export default BaseTree;