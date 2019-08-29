import Vue from 'vue';
import WikiDetailView from './WikiDetailView.vue';
import filter from '@src/filter';
import { Form, FormItem, Button, Input, Tag } from 'element-ui';
import '@src/component/element-ui/element-variables.scss';

Vue.prototype.$ELEMENT = { size: 'small'};
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Tag);
Vue.use(filter)

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
} catch (error) {
  console.error(error)
  console.error('no init data')
}

const WikiDetailViewComp = Vue.extend(WikiDetailView);
const app = new WikiDetailViewComp({
  propsData: {
    initData
  }
});

app.$mount('#app');

export default app;