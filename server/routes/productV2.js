const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');
router.get('/productV2/catalog/edit', async ctx => {
  let script = ['/productV2.catalog.index.js'];
  let modConfig = modules['productV2.catalog.index'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/catalog/edit', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品目录管理', body, script, modConfig.template)
});
router.get('/productV2/catalog/list', async ctx => {
  let script = ['/productV2.catalog.list.js'];
  let modConfig = modules['productV2.catalog.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/catalog/list', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品目录列表', body, script, modConfig.template)
});

router.get('/productV2/catalog/view', async ctx => {
  let script = ['/productV2.catalog.view.js'];
  let modConfig = modules['productV2.catalog.view'];
  let reqHeaders = ctx.request.headers;
  let url = `/task/view/${ctx.params.id}`;
  let result = await HttpClient.request(url, 'get', null, {headers: reqHeaders});
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品目录详情', body, script, modConfig.template)
});

router.get('/productV2/list', async ctx => {
  let script = ['/productV2.list.js'];
  let modConfig = modules['productV2.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/list', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品列表', body, script, modConfig.template)
});

router.get('/productV2/view/:id', async ctx => {
  let modConfig = modules['productV2.view'];
  let reqHeaders = ctx.request.headers;
  let script = ['/productV2.view.js'];

  let url = `/task/view/${ctx.params.id}`;
  let result = await HttpClient.request(url, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('产品详情', body, script, modConfig.template)
});
router.get('/productV2/catalog/setting', async ctx => {
  let script = ['/productV2.catalog.setting.js'];
  let modConfig = modules['productV2.catalog.setting'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/catalog/setting', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品目录设置', body, script, modConfig.template)
});
router.get('/productV2/catalog/settingField', async ctx => {
  let script = ['/productV2.catalog.settingField.js'];
  let modConfig = modules['productV2.catalog.settingField'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/productV2/catalog/settingField', 'get', null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml('产品目录表单设置', body, script, modConfig.template)
});

router.get('/productV2/catalog/view/:id', async ctx => {
  let script = ['/productV2.catalog.view.js'];
  let modConfig = modules['productV2.catalog.view'];
  let reqHeaders = ctx.request.headers;
  
  let result = await HttpClient.request(`/customer/product/view/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('产品目录详情', body, script, modConfig.template)
});

module.exports = router;