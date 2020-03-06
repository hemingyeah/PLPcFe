import Vue from '@src/common/entry';
import http from '@src/util/http';
import SettingProductFieldsView from './setting.product.fields.vue';

Vue.prototype.$http = http;

//处理注入的参数
let initData = {};
try {
  // initData = JSON.parse(window._init || '{}');
  let customerOption = {
    linkman: true,
    address: true,
    linkmanNotNull: true,
    addressNotNull: true,
  }
  let data = JSON.parse(window._init || '{}');
  data.fields.forEach(item => {
    if(item.fieldName == 'customer') {
      item.formType = 'customer',
      item.setting.customerOption = customerOption;
    }
  })

  initData = data;

} catch (error) {
    console.error(error)
    console.error('no init data')
}

const PageComponent = Vue.extend(SettingProductFieldsView);
const app = new PageComponent({
    propsData: {
        initData
    }
});

app.$mount('#app');

export default app;