import BaseFileItem from './BaseFileItem.vue';

BaseFileItem.install = function(Vue){
  Vue.component(BaseFileItem.name, BaseFileItem)
}

export default BaseFileItem;