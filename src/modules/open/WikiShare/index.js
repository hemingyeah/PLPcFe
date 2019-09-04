import Vue from 'vue';
import WikiDetailView from './WikiDetailView.vue';
import { Form, FormItem, Button, Input, Tag } from 'element-ui';
import '@src/component/element-ui/element-variables.scss';
import * as Lang from '@src/util/lang/index.js'

Vue.prototype.$ELEMENT = { size: 'small'};
Vue.use(Button);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(Tag);

// 处理注入的参数
let initData = {};
try {
  initData = JSON.parse(window._init);
  initData.createTime = Lang.formatDate(initData.createTime, 'YYYY-MM-DD HH:mm');
  console.log(initData);
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