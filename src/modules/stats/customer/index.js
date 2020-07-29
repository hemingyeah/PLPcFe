import '../../../../resource/component/css/component_v2_pc.css'
import '../common/common.scss';

import Vue from 'vue';
import CustomerView from './CustomerView.vue';
import filters from 'src/filters';
import StatsChartEmpty from '../common/StatsChartEmpty.vue';
import { 
  Popover,
  Table, TableColumn,
  Pagination,
  Tooltip
} from 'element-ui';
import StatsPopverIcon from '../common/StatsPopoverIcon.vue';
import Loading from 'packages/BaseLoading'

import Platform from 'src/util/Platform';
import BizTeamSelect from '../../../../resource/component/component_v2_pc.js';

import * as mtracker from '../../../util/MTracker';

mtracker.initializeTalkingData();

for(let name in filters) Vue.filter(name, filters[name]);

Vue.use(BizTeamSelect)
Vue.component(Popover.name, Popover);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(Pagination.name, Pagination);
Vue.component(Tooltip.name, Tooltip);

Vue.component(StatsChartEmpty.name, StatsChartEmpty);
Vue.component(StatsPopverIcon.name, StatsPopverIcon);

Vue.prototype.$platform = Platform;
Vue.prototype.$loading = Loading;
Vue.prototype.$tdOnEvent = mtracker.onEvent;

const app = new Vue({
  el: "#app",
  render: h => h(CustomerView)
});

export default app;