import '../../../../resource/component/css/component_v2_pc.css'
import '../common/common.scss';

import Vue from 'vue';
import { 
  Popover, 
  Table, TableColumn, 
  Dropdown, DropdownItem, DropdownMenu, 
  Checkbox, 
  Select, Option, 
  Pagination,
  Tabs,
  TabPane,
  Tooltip,
} from 'element-ui';

import StatsPopverIcon from '../common/StatsPopoverIcon.vue';
import StatsChartEmpty from '../common/StatsChartEmpty.vue';
import ServiceView from './ServiceView.vue'
import Loading from 'packages/BaseLoading';

import Platform from 'src/util/Platform';
import http from 'src/util/HttpUtil';
import filters from 'src/filters';

import BizTeamSelect from '../../../../resource/component/component_v2_pc.js';

import * as mtracker from '../../../util/MTracker';

mtracker.initializeTalkingData();

Vue.use(BizTeamSelect)
Vue.component(Popover.name, Popover);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(Dropdown.name, Dropdown);
Vue.component(DropdownItem.name, DropdownItem);
Vue.component(DropdownMenu.name, DropdownMenu);
Vue.component(Checkbox.name, Checkbox);
Vue.component(Select.name, Select);
Vue.component(Option.name, Option);
Vue.component(Pagination.name, Pagination);
Vue.component(Tooltip.name, Tooltip);

Vue.component(StatsPopverIcon.name, StatsPopverIcon);
Vue.component(StatsChartEmpty.name, StatsChartEmpty);
Vue.component(Tabs.name, Tabs);
Vue.component(TabPane.name, TabPane);

for(let name in filters) Vue.filter(name, filters[name]);

Vue.prototype.$platform = Platform;
Vue.prototype.$loading = Loading;
Vue.prototype.$http = http;
Vue.prototype.$tdOnEvent = mtracker.onEvent;

const app = new Vue({
  el: "#app",
  render: h => h(ServiceView)
});

export default app;