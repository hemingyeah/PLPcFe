import Vue from 'vue';

import CustomerListView from './CustomerListView.vue';

const CustomerListViewComp = Vue.extend(CustomerListView);
const app = new CustomerListViewComp({

});

app.$mount('#app');

export default app;