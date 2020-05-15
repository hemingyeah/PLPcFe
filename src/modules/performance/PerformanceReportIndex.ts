
import Vue from '@src/common/entry';
import http from '@src/util/http';
import PerformanceView from './PerformanceReportView.vue';

Vue.prototype.$http = http;

const PerformanceViewComp = Vue.extend(PerformanceView);
let initData = {};


try {
    initData = JSON.parse((<any>window)._init || '{}');
} catch (error) {
    console.error(error)
    console.error('no init data')
}

const app = new PerformanceViewComp({
    propsData: {
        initData
    }
});

app.$mount('#app');

export default app;