import 'packages/ElementUI'
import '../../../assets/scss'

import Vue from 'vue';

import component from '../../../component';
import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseExport from 'packages/BaseExport';
import BasePanel from 'packages/BasePanel';
import BaseSelectionBar from 'packages/BaseSelectionBar';
import directive from '../../../directive';

import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';
import filters from '../../../filter';
import * as math from 'mathjs';
import RepertoryRecordView from './RepertoryRecordView.vue';


import * as mtracker from '../../../util/Mtrackers';

mtracker.initializeTalkingData();

Vue.use(component);
Vue.use(directive);
Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseExport.name, BaseExport)
Vue.component(BasePanel.name, BasePanel);
Vue.component(BaseSelectionBar.name, BaseSelectionBar);
for (let name in filters) Vue.filter(name, filters[name]);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;
Vue.prototype.$tdOnEvent = mtracker.onEvent;
Vue.prototype.$math = math;


const app = new Vue({
    el: "#app",
    render: h => h(RepertoryRecordView)
});

export default app;