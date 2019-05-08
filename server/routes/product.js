const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../config/modules');

/** start 产品 */
router.get('/customer/product', async ctx => {
  let script = ['/product.list.js'];
  let modConfig = modules['product.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/customer/product', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('产品管理', body, script, modConfig.template)
});

router.get('/customer/product/view/:id', async ctx => {
  let script = ['/product.view.js'];
  let modConfig = modules['product.view'];
  let reqHeaders = ctx.request.headers;
  
  let result = await HttpClient.request(`/customer/product/view/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('产品详情', body, script, modConfig.template)
});

router.get('/customer/product/create', async ctx => {
  let modConfig = modules['product.edit'];
  let script = ['/product.edit.js'];
  let reqHeaders = ctx.request.headers;
  
  const customerId = ctx.request.query.customerId;
  
  let result = await HttpClient.request(`/customer/product/create?customerId=${customerId}`, 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('新建产品', body, script, modConfig.template)
});

router.get('/customer/product/edit/:id', async ctx => {
  let modConfig = modules['product.edit'];
  let script = ['/product.edit.js'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request(`/customer/product/edit/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  // let result = await HttpClient.request('/customer/product/list/page', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑产品', body, script, modConfig.template)
});

router.get('/product/createOnTask', async ctx => {
  let modConfig = modules['product.edit.modal'];
  let script = ['/product.edit.modal.js'];
  let reqHeaders = ctx.request.headers;
  // let result = await HttpClient.request(`/customer/product/edit/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let result = await HttpClient.request('/product/createOnTask', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑产品', body, script, modConfig.template)
});

router.get('/product/createOnEvent', async ctx => {
  let modConfig = modules['product.edit.modal'];
  let script = ['/product.edit.modal.js'];
  let reqHeaders = ctx.request.headers;
  // let result = await HttpClient.request(`/customer/product/edit/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let result = await HttpClient.request('/product/createOnTask', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑产品', body, script, modConfig.template)
});

/** end 产品 */

/** start 产品模板 */
router.get('/product', async ctx => {
  let script = ['/product.template.list.js'];
  let modConfig = modules['product.template.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/product', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('产品模板列表', body, script, modConfig.template)
});

router.get('/product/create', async ctx => {
  let modConfig = modules['product.template.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/product.template.edit.js'];
  let result = await HttpClient.request('/product/create', 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('新建产品模板', body, script, modConfig.template)
});

router.get('/product/edit/:id', async ctx => {
  let modConfig = modules['product.template.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/product.template.edit.js'];
  let result = await HttpClient.request(`/product/edit/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑产品模板', body, script, modConfig.template)
});

router.get('/product/detail/:id', async ctx => {
  let modConfig = modules['product.template.view'];
  let reqHeaders = ctx.request.headers;
  let script = ['/product.template.view.js'];
  let result = await HttpClient.request(`/product/detail/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('产品模板信息', body, script, modConfig.template)
});
/** end 产品模板 */

module.exports = router;
