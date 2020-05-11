import '../common/common.scss';

import Vue from 'vue';

import Loading from 'packages/BaseLoading'

import { 
  Popover, 
  Table, TableColumn, Pagination,
  Dropdown, DropdownItem, DropdownMenu, 
  Checkbox,
  Tooltip
} from 'element-ui';
import StatsPopverIcon from '../common/StatsPopoverIcon.vue';
import StationView from './StationView.vue';

import filters from 'src/filters';

import * as mtracker from '../../../util/MTracker';

mtracker.initializeTalkingData();

for(let name in filters) Vue.filter(name, filters[name]);

Vue.prototype.$loading = Loading;
Vue.prototype.$tdOnEvent = mtracker.onEvent;

Vue.component(Popover.name, Popover);
Vue.component(Table.name, Table);
Vue.component(TableColumn.name, TableColumn);
Vue.component(Dropdown.name, Dropdown);
Vue.component(DropdownItem.name, DropdownItem);
Vue.component(DropdownMenu.name, DropdownMenu);
Vue.component(Checkbox.name, Checkbox);
Vue.component(Pagination.name, Pagination);
Vue.component(Tooltip.name, Tooltip);
Vue.component(StatsPopverIcon.name, StatsPopverIcon);

const app = new Vue({
  el: "#app",
  render: h => h(StationView)
}); 

export default app;