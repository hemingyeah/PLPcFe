import 'packages/ElementUI'
import '../../../../src/assets/scss/index.scss'

import Vue from 'vue';
import component from '../../../../src/component';
import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseImport from 'packages/BaseImport';
import BaseExport from 'packages/BaseExport';
import BasePanel from 'packages/BasePanel';
import BaseSelectionBar from 'packages/BaseSelectionBar';
import directive from '../../../directive';

import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';
import RepertoryStockView from './RepertoryStockView.vue';


import * as mtracker from '../../../util/Mtrackers';
import * as math from 'mathjs';

mtracker.initializeTalkingData();

Vue.use(component);
Vue.use(directive);
Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseImport.name, BaseImport);
Vue.component(BaseExport.name, BaseExport);
Vue.component(BasePanel.name, BasePanel);
Vue.component(BaseSelectionBar.name, BaseSelectionBar);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;
Vue.prototype.$tdOnEvent = mtracker.onEvent;
Vue.prototype.$math = math;

const app = new Vue({
    el: "#app",
    render: h => h(RepertoryStockView)
});

export default app;