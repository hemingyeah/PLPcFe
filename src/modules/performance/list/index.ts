
import Vue from '@src/common/entry';
import http from '@src/util/http';
import ListView from './ListView.vue';

Vue.prototype.$http = http;

const ListViewComp = Vue.extend(ListView);
const app = new ListViewComp({});

app.$mount('#app');

export default app;