import './common.scss';

import BaseTable from './BaseTable.vue';
import BaseTableAdvanceSetting from './BaseTableAdvanceSetting'

BaseTable.install = function(Vue){
  Vue.component(BaseTable.name, BaseTable);
  Vue.component(BaseTableAdvanceSetting.name, BaseTableAdvanceSetting);
}

export default BaseTable;