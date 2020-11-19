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

router.get('/setting/task/field/task', async ctx => {
  let modConfig = modules['setting.task.fields'];
  let script = ['/setting.task.fields.js'];
  let { url, headers } = ctx.request;
  let result = await HttpClient.request(url, 'get', null, { headers });
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('工单表单设置', body, script, modConfig.template)
});

router.get('/setting/task/field/taskReceipt', async ctx => {
  let modConfig = modules['setting.task.receipt_fields'];
  let script = ['/setting.task.receipt_fields.js'];
  
  ctx.body = Template.renderWithData('工单回执表单设置', {}, script, modConfig.template)
});


router.get('/system/mall/index', async ctx => {
  let script = ['/system.mall.index.js'];
  let modConfig = modules['system.mall.index'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/setting/serviceStation/markSpareGray', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('商品列表', body, script, modConfig.template)
});

module.exports = router;