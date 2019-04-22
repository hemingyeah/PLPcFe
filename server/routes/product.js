const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../config/modules');

router.get('/customer/product_v2', async ctx => {
  let script = ['/product.list.js'];
  let modConfig = modules['product.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/customer', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('产品管理', body, script, modConfig.template)
});

// router.get('/product/create', async ctx => {
//   let modConfig = modules['customer.edit'];
//   let reqHeaders = ctx.request.headers;
//   let script = ['/customer.edit.js'];
//   let result = await HttpClient.request('//customer/create', 'get', null, {headers: reqHeaders});
//   let body = result.body;
//
//   ctx.body = Template.renderWithHtml('新建客户', body, script, modConfig.template)
// });
//
// router.get('/product/edit/:id', async ctx => {
//   let modConfig = modules['customer.edit'];
//   let reqHeaders = ctx.request.headers;
//   let script = ['/customer.edit.js'];
//   let result = await HttpClient.request(`/customer/edit/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
//   let body = result.body;
//
//   ctx.body = Template.renderWithHtml('编辑客户', body, script, modConfig.template)
// });


router.get('/product/template', async ctx => {
  let script = ['/product.template.list.js'];
  let modConfig = modules['product.template.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/customer', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('产品模板管理', body, script, modConfig.template)
});


module.exports = router;
