import Vue from 'vue';
import WikiDetailView from './WikiDetailView.vue';
import { Form, FormItem, Button, Input, Tag } from 'element-ui';
import '@src/component/element-ui/element-variables.scss';

Vue.prototype.$ELEMENT = { size: 'small'};
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Tag);

const WikiDetailViewComp = Vue.extend(WikiDetailView);
const app = new WikiDetailViewComp({
});

app.$mount('#app');

export default app;