import Vue from 'vue';

import CustomerEditView from './CustomerEditView.vue';

const CustomerEditViewComp = Vue.extend(CustomerEditView);
const app = new CustomerEditViewComp({

});

app.$mount('#app');

export default app;