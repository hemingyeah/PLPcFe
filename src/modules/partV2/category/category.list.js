import '../../../../packages/ElementUI'
import '../../../../src/assets/scss/index.scss'

import Vue from 'vue';

import component from '../../../component';
import BaseCollapsePanel from '../../../../packages/BaseCollapsePanel';
import BaseImport from '../../../../packages/BaseImport';
import BaseExport from '../../../../packages/BaseExport';
import BasePanel from '../../../../packages/BasePanel';
import BaseSelectionBar from '../../../../packages/BaseSelectionBar';
import { Popover } from 'element-ui';
import StatsPopverIcon from './components/StatsPopoverIcon.vue';
import directive from '../../../directive';

import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';

import CategoryListView from './CategoryListView.vue';

import * as mtracker from '../../../util/Mtrackers';

mtracker.initializeTalkingData();

Vue.use(component);
Vue.use(directive);
Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseImport.name, BaseImport);
Vue.component(BaseExport.name, BaseExport);
Vue.component(Popover.name, Popover);
Vue.component(StatsPopverIcon.name, StatsPopverIcon);
Vue.component(BasePanel.name, BasePanel);
Vue.component(BaseSelectionBar.name, BaseSelectionBar);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;
Vue.prototype.$tdOnEvent = mtracker.onEvent;

const app = new Vue({
    el: "#app",
    render: h => h(CategoryListView)
});

export default app;