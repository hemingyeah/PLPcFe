import 'packages/ElementUI'
import '../../../../src/assets/scss/index.scss'
// import './element-variables.scss'
import Vue from 'vue';

import component from '../../../component';
import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BasePanel from 'packages/BasePanel';
import BaseSelectionBar from 'packages/BaseSelectionBar';
import directive from '../../../directive';

import BaseExport from 'packages/BaseExport';
import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';
import filters from '../../../filter/filter';

import RepertoryApplyView from './RepertoryApplyView.vue';

import * as mtracker from '../../../util/Mtrackers';
import * as math from 'mathjs';


mtracker.initializeTalkingData();

Vue.use(component);
Vue.use(directive);
Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BasePanel.name, BasePanel);
Vue.component(BaseSelectionBar.name, BaseSelectionBar);

Vue.component(BaseExport.name, BaseExport);
for (let name in filters) Vue.filter(name, filters[name]);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;
Vue.prototype.$tdOnEvent = mtracker.onEvent;
Vue.prototype.$math = math;

const app = new Vue({
    el: "#app",
    render: h => h(RepertoryApplyView)
});

export default app;