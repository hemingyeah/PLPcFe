import BaseExport from './BaseExport.vue';

BaseExport.install = function(Vue){
  Vue.component(BaseExport.name, BaseExport);
};

export default BaseExport;
