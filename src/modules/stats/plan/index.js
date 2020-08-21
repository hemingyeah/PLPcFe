import '../../../../resource/component/css/component_v2_pc.css'
import '../common/common.scss';

import Vue from 'vue';
import filters from 'src/filters';

import Platform from 'src/util/Platform'
import Loading from 'packages/BaseLoading'

import { Popover, Tooltip } from 'element-ui';
import BaseTable from 'packages/BaseTable';
import StatsPopverIcon from '../common/StatsPopoverIcon.vue';

import PlanView from './PlanView.vue'
import BizTeamSelect from '../../../../resource/component/component_v2_pc.js';

import * as mtracker from '../../../util/MTracker';

mtracker.initializeTalkingData();

for(let name in filters) Vue.filter(name, filters[name]);

Vue.use(BizTeamSelect)
Vue.component(Popover.name, Popover);
Vue.component(Tooltip.name, Tooltip);
Vue.component(StatsPopverIcon.name, StatsPopverIcon)
Vue.component(BaseTable.name, BaseTable);

Vue.prototype.$platform = Platform;
Vue.prototype.$loading = Loading;
Vue.prototype.$tdOnEvent = mtracker.onEvent;

const app = new Vue({
  el: "#app",
  render: h => h(PlanView)
});

export default app;     