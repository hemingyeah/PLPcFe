import BaseExportGroup from './BaseExportGroup.vue';

BaseExportGroup.install = function(Vue){
  Vue.component(BaseExportGroup.name, BaseExportGroup);
};

export default BaseExportGroup;
