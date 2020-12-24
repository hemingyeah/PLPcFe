const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/setting/customer/fields', async ctx => {
  let script = ['/setting.customer.fields.js'];
  let modConfig = modules['setting.customer.fields'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/customer/fields', 'get', null, {headers: reqHeaders});
  let body = result.body;
  ctx.body = Template.renderWithHtml('客户设置', body, script, modConfig.template)
});

router.get('/setting/product/fields', async ctx => {
  let script = ['/setting.product.fields.js'];
  let modConfig = modules['setting.product.fields'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/product/fields', 'get', null, {headers: reqHeaders});
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品设置', body, script, modConfig.template)
});

router.get('/setting/performance/v2/rule', async ctx => {
  let script = ['/setting.performance.rule.js'];
  let modConfig = modules['setting.performance.rule'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/performance/v2/rule', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('绩效规则', body, script, modConfig.template)
});

router.get('/setting/taskType/manage', async ctx => {
  let modConfig = modules['setting.task.manage'];
  let script = ['/setting.task.manage.js'];
  let { url, headers } = ctx.request;
  let result = await HttpClient.request(url, 'get', null, { headers });
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('工单类型设置', body, script, modConfig.template)
});

router.get('/setting/task/taskFormSet', async ctx => {
  let modConfig = modules['setting.task.flow'];
  let script = ['/setting.task.flow.js'];
  let { url, headers } = ctx.request;
  let result = await HttpClient.request(url, 'get', null, { headers });
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('工单流程设置', body, script, modConfig.template)
});

router.get('/setting/task/cardManage', async ctx => {
  let modConfig = modules['setting.task.additional'];
  let script = ['/setting.task.additional.js'];
  let { url, headers } = ctx.request;
  let result = await HttpClient.request(url, 'get', null, { headers });
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('附加组件设置', body, script, modConfig.template)
});

router.get('/setting/serviceStation/card/view', async ctx => {
  let modConfig = modules['setting.task.addcard_fields'];
  let script = ['/setting.task.addcard_fields.js'];
  
  ctx.body = Template.renderWithData('附加组件表单设置', {}, script, modConfig.template)
});

router.get('/setting/serviceStation/partShop', async ctx => {
  let script = ['/system.mall.index.js'];
  let modConfig = modules['system.mall.index'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/serviceStation/partShop', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('商品列表', body, script, modConfig.template)
});

module.exports = router;