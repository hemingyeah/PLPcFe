
import Vue from '@src/common/entry';
import http from '@src/util/http';
import ListView from './ListView.vue';

Vue.prototype.$http = http;

const ListViewComp = Vue.extend(ListView);
let initData = {};

console.log('window', window);

try {
    initData = JSON.parse((<any>window)._init || '{}');
} catch (error) {
    console.error(error)
    console.error('no init data')
}

console.log('initData', initData);



const app = new ListViewComp({});

app.$mount('#app');

export default app;