import './common.scss';

import BaseTable from './BaseTable.vue';

BaseTable.install = function(Vue){
  Vue.component(BaseTable.name, BaseTable);
}

export default BaseTable;