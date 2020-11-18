import Vue from '@src/common/entry';
import Mall from './mall.vue';
import http from '@src/util/HttpUtil';

// 处理注入的参数
let initData = {
  "isSparepart2":true,
  "auths":{
      "TASK_ADD":3,
      "PRODUCT_CREATE":3,
      "CUSTOMER_CREATE":3,
      "VIP_PAYMENT_ONLINE":3,
      "TASK_BATCH_DISPATCH":3,
      "CASE_ADD":3,
      "SERVICE_CREATE":3,
      "CALLCENTER_EDIT":3,
      "CASE_VIEW":3,
      "CALLCENTER_VIEW":3,
      "TASK_EDIT":3,
      "TASK_FEEDBACK":3,
      "VIP_INFO_NOTICE_SELECT":3,
      "LOGIN_PC":3,
      "VIP_INFO_NOTICE_CREATE":3,
      "SERVICE_EDIT":3,
      "PORTAL_ORDER":3,
      "PRODUCT_EDIT":3,
      "VIP_SPAREPART_BACK":3,
      "TASK_DISPATCH":3,
      "REPORT_VIEW":3,
      "TASK_POOL":3,
      "VIP_REPORT_VIEW":3,
      "TASK_VIEW":3,
      "AUTH_STAFF":3,
      "AUTH_ROLE":3,
      "TASK_CLOSE":3,
      "TASK_BATCH_CLOSE":3,
      "VIP_SPAREPART_PERSION":3,
      "INFO_EDIT":3,
      "VIP_SPAREPART_INOUT":3,
      "TASK_AUDIT":3,
      "PRODUCT_VIEW":3,
      "CUSTOMER_DELETE":3,
      "CASE_DELETE":3,
      "INFO_VIEW":3,
      "EXPORT_IN":3,
      "VIP_APPROVE":3,
      "PART_EDIT":3,
      "SERVICE_VIEW":3,
      "CUSTOMER_VIEW":3,
      "VIP_SPAREPART_CREATE":3,
      "VIP_SPAREPART_VIEW":3,
      "CUSTOMER_PQRCODE":3,
      "TASK_DELETE":3,
      "VIP_TASK_PLAN":3,
      "CALLCENTER_STATISTICS":3,
      "PRODUCT_DELETE":3,
      "CASE_EDIT":3,
      "VIP_INFO_CREATE":3,
      "SYSTEM_SEETING":3,
      "LOGIN_YD":3,
      "VIP_SPAREPART_EDIT":3,
      "PART_VIEW":3,
      "AUTH_TAG":3,
      "VIP_SPAREPART_STOCK":3,
      "TASK_BATCH_AUDIT":3,
      "CUSTOMER_EDIT":3
  },
  "sparepartType":[
      "商品类别",
      "库存类别",
      "备件类型1",
      "个人类别",
      "产品类别",
      "测试产品仓库是否重复字样"
  ],
  "precision":0,
  "tagIds":[
      "071f50ad-c03d-11e9-bf0c-506b4b2bb4ae",
      "9b92f3f9-a14f-11e9-8123-7cd30abca02e"
  ],
  "isPersonalRepertory":true,
  "userId":"b8a4dc27-d82f-11e8-8abd-7cd30abca02e",
  "tagIdsWithChildTag":[
      "071f50ad-c03d-11e9-bf0c-506b4b2bb4ae",
      "5fe2e94f-adc6-11e9-8123-7cd30abca02e",
      "9b92f3f9-a14f-11e9-8123-7cd30abca02e",
      "de932a1d-36d3-11ea-9ddd-00163e0f1a1b"
  ]
};

// try {
//   initData = typeof window._init == 'string' ? JSON.parse(window._init || '{}') : window._init;
// } catch (error) {
//   console.warn(error)
//   console.warn('no init data')
// }

Vue.prototype.$http = http;

const app = new Vue({
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => h(Mall)
})

app.$mount('#app')

export default app;