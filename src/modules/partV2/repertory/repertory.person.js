// import '../../../../resource/component/css/component_v2_pc.css'
import Vue from 'vue';

import 'packages/ElementUI'
import '../../../../src/assets/scss/index.scss'
import component from '../../../component';
import BaseCollapsePanel from 'packages/BaseCollapsePanel';
import BaseExport from 'packages/BaseExport';
import BasePanel from 'packages/BasePanel';
import BaseSelectionBar from 'packages/BaseSelectionBar';
import directive from '../../../directive';

import Platform from '@src/util/Platform';
import Http from '@src/util/HttpUtil';

//copy了resource整体文件夹
// import BizTeamSelect from '../../../../resource/component/component_v2_pc.js'

import RepertoryPersonView from './RepertoryPersonView.vue';


import * as mtracker from '../../../util/Mtrackers';
import * as math from 'mathjs';

mtracker.initializeTalkingData();

Vue.use(component)
Vue.use(BizTeamSelect)
Vue.use(directive)
Vue.component(BaseCollapsePanel.name, BaseCollapsePanel);
Vue.component(BaseExport.name, BaseExport);
Vue.component(BasePanel.name, BasePanel);
Vue.component(BaseSelectionBar.name, BaseSelectionBar);

Vue.prototype.$platform = Platform;
Vue.prototype.$http = Http;
Vue.prototype.$tdOnEvent = mtracker.onEvent;
Vue.prototype.$math = math;

const app = new Vue({
    el: "#app",
    render: h => h(RepertoryPersonView)
});

export default app;