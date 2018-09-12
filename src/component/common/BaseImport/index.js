import BaseImport from './BaseImport.vue';

BaseImport.install = function(Vue){
  Vue.component(BaseImport.name, BaseImport);
};

export default BaseImport;