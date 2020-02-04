import Vue from '@src/common/entry';
import http from '@src/util/http';

const DepartmentView = () => import('./DepartmentView.vue');

Vue.prototype.$http = http;
Vue.prototype.$eventBus = new Vue();

// let initJson = {"authorities":{"TASK_ADD":3,"PRODUCT_CREATE":3,"CUSTOMER_CREATE":3,"VIP_PAYMENT_ONLINE":3,"TASK_BATCH_DISPATCH":3,"CASE_ADD":3,"SERVICE_CREATE":3,"CASE_VIEW":3,"TASK_EDIT":3,"TASK_FEEDBACK":3,"VIP_INFO_NOTICE_SELECT":3,"LOGIN_PC":3,"SMS_CONFIG":3,"VIP_INFO_NOTICE_CREATE":3,"SERVICE_EDIT":3,"PRODUCT_EDIT":3,"TASK_DISPATCH":3,"TASK_POOL":3,"VIP_REPORT_VIEW":3,"TASK_VIEW":3,"AUTH_STAFF":3,"AUTH_ROLE":3,"TASK_CLOSE":3,"TASK_BATCH_CLOSE":3,"VIP_SPAREPART_PERSION":3,"INFO_EDIT":3,"VIP_SPAREPART_INOUT":3,"TASK_AUDIT":3,"PRODUCT_VIEW":3,"CUSTOMER_DELETE":3,"CASE_DELETE":3,"INFO_VIEW":3,"EXPORT_IN":3,"VIP_APPROVE":3,"PART_EDIT":3,"SERVICE_VIEW":3,"CUSTOMER_VIEW":3,"VIP_SPAREPART_CREATE":3,"VIP_SPAREPART_VIEW":3,"CUSTOMER_PQRCODE":3,"TASK_DELETE":3,"VIP_TASK_PLAN":3,"PRODUCT_DELETE":3,"CASE_EDIT":3,"VIP_INFO_CREATE":3,"SYSTEM_SEETING":3,"LOGIN_YD":3,"VIP_SPAREPART_EDIT":3,"PART_VIEW":3,"AUTH_TAG":3,"VIP_SPAREPART_STOCK":3,"TASK_BATCH_AUDIT":3,"CUSTOMER_EDIT":3},"canUpdateRole":true,"rolesJson":[{"id":"1","text":"系统管理员"},{"id":"2","text":"普通管理员"},{"id":"3","text":"服务工程师"},{"id":"4","text":"回访客服"},{"id":"5","text":"服务总监"},{"id":"6","text":"财务结算员"},{"id":"7","text":"备件库管理员"},{"id":"8","text":"服务台管理员"},{"id":"9","text":"团队管理员"},{"id":"10","text":"服务台客服"},{"id":"04361359-7cdd-11e7-9f7e-00163e304a25","text":"一千"},{"id":"08e0e88b-dada-11e9-bfc9-00163e304a25","text":"测试重复新建角23"},{"id":"0c7dcfba-baf9-11e8-b3c6-00163e304a25","text":"个人备件库 - 个人权限"},{"id":"11d2162d-9d9c-11e9-bfc9-00163e304a25","text":"团队权限es"},{"id":"1cdd6429-10fa-11ea-bfc9-00163e304a25","text":"测试1234"},{"id":"21158f2c-baf9-11e8-b3c6-00163e304a25","text":"个人备件库 - 团队权限"},{"id":"22218717-9149-11e7-9789-00163e304a25","text":"千一"},{"id":"22fa17c6-9ce7-11e7-9789-00163e304a25","text":"自定义系统管理员"},{"id":"2448040e-148c-11e9-b3c6-00163e304a25","text":"测试客户导出"},{"id":"29f62806-0bda-11e8-8a05-00163e304a25","text":"数据权限测试"},{"id":"2a4c43be-cef5-11e9-bfc9-00163e304a25","text":"测试测试"},{"id":"2c6491c4-72eb-11e9-bfc9-00163e304a25","text":"测试服务团队角色"},{"id":"30116218-bb3a-11e8-b3c6-00163e304a25","text":"备件库权限测试"},{"id":"31a5eed8-6aed-11e9-bfc9-00163e304a25","text":"公告"},{"id":"3a0b8a7a-ff3d-11e7-9070-00163e304a25","text":"管理员AAA"},{"id":"44371887-7ce4-11e7-9f7e-00163e304a25","text":"显示问题"},{"id":"59572a63-1ac3-11e8-b7b4-00163e304a25","text":"备件2.0"},{"id":"73c82056-0608-11ea-bfc9-00163e304a25","text":"测试工单池地图权限"},{"id":"75f6d3ab-7776-11e9-bfc9-00163e304a25","text":"姜彤测试权限"},{"id":"77223fb3-8367-11e8-8546-00163e304a25","text":"权限测试"},{"id":"8eb17fce-1d34-11e8-b7b4-00163e304a25","text":"备件2.0测试"},{"id":"8ef7103f-04d3-11e8-8a05-00163e304a25","text":"工单团队权限"},{"id":"93a39dcd-1bc2-11ea-bfc9-00163e304a25","text":"日程权限测试"},{"id":"a02d9f79-fa21-11e7-9070-00163e304a25","text":""},{"id":"a82b97ec-8447-11e9-bfc9-00163e304a25","text":"测试权限->工作台"},{"id":"a86e3d2d-1eba-11e9-b3c6-00163e304a25","text":"首页团队权限"},{"id":"afdf8327-50ff-11e9-bfc9-00163e304a25","text":"测试客户编辑权限团队。"},{"id":"b02b96d0-04d0-11e8-8a05-00163e304a25","text":"人员管理"},{"id":"b9cff4d8-7cdc-11e7-9f7e-00163e304a25","text":"团队工单权限"},{"id":"c1b8bff8-4ba8-11e9-bfc9-00163e304a25","text":"王测试勿动"},{"id":"ce0e81bd-fa22-11e7-9070-00163e304a25","text":"222"},{"id":"ced9bf03-0045-11e8-8a05-00163e304a25","text":"111"},{"id":"d37072f5-c8e0-11e7-9070-00163e304a25","text":"测试"},{"id":"e91f9a3a-2523-11ea-bfc9-00163e304a25","text":"ZYD测试专用"},{"id":"eb48364d-fa22-11e7-9070-00163e304a25","text":"333"},{"id":"f1d52732-fa21-11e7-9070-00163e304a25","text":""}],"canUpdateTag":true}
// 处理注入的参数
let initData = {};

try {
  initData = JSON.parse(window._init || '{}');
} catch (error) {
  console.log(error);
  console.log('no init data');
}

const app = new Vue({
  el: '#app',
  provide: {
    initData: Object.freeze(initData)
  },
  render: h => (<DepartmentView></DepartmentView>)
})

export default app;