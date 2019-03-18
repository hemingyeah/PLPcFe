
import Vue from '@src/common/entry';
import http from '@src/util/http';
import ListView from './ListView.vue';
import { Notification } from 'element-ui';

(<any>window).__exports__notification = Notification;

Vue.prototype.$http = http;

const ListViewComp = Vue.extend(ListView);
let initData = {};


try {
    initData = JSON.parse((<any>window)._init || '{}');
} catch (error) {
    console.error(error)
    console.error('no init data')
}

const app = new ListViewComp({
    propsData: {
        initData
    }
});

app.$mount('#app');

export default app;