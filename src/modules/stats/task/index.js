import '../../../../resource/component/css/component_v2_pc.css'
import '../common/common.scss';

import Vue from 'vue';

import Loading from 'packages/BaseLoading';
import StatsChartEmpty from '../common/StatsChartEmpty.vue';
import { Popover, Table, TableColumn, Pagination, Tooltip } from 'element-ui';
import StatsPopverIcon from '../common/StatsPopoverIcon.vue';

import TaskView from './TaskView.vue'
import filters from 'src/filters';

import http from 'src/util/HttpUtil';
import BizTeamSelect from '../../../../resource/component/component_v2_pc.js';

import * as mtracker from '../../../util/MTracker';

mtracker.initializeTalkingData();

for(let name in filters) Vue.filter(name, filters[name]);

Vue.prototype.$loading = Loading;
Vue.prototype.$http = http;
Vue.prototype.$tdOnEvent = mtracker.onEvent;

Vue.use(BizTeamSelect)
Vue.component(StatsChartEmpty.name, StatsChartEmpty);
Vue.component(Popover.name, Popover);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(Pagination.name, Pagination);
Vue.component(StatsPopverIcon.name, StatsPopverIcon);
Vue.component(Tooltip.name, Tooltip);

const app = new Vue({
  el: "#app",
  render: h => h(TaskView)
});

export default app;