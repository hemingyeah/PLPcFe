const KoaRouter = require('koa-router');
const HttpClient = require('../util/HttpClient');
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

// 备件品类
router.get('/partV2/category/list', async ctx => {
  let script = ['/sparePart.list.js'];
  let modConfig = modules['sparePart.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/partV2/category/list', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtmlForPart('备件品类', body, script, modConfig.template);

})

// 备件库存
router.get('/partV2/repertory/stock', async ctx => {
  let script = ['/sparePart.storck.js'];
  let modConfig = modules['sparePart.storck'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/partV2/repertory/stock', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtmlForPart('备件库存', body, script, modConfig.template);

})

// 出入库记录
router.get('/partV2/repertory/record', async ctx => {
  let script = ['/sparePart.record.js'];
  let modConfig = modules['sparePart.record'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/partV2/repertory/record', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtmlForPart('出入库记录', body, script, modConfig.template);

})

// 办理出入库
router.get('/partV2/repertory/apply', async ctx => {
  let script = ['/sparePart.apply.js'];
  let modConfig = modules['sparePart.apply'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/partV2/repertory/apply', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtmlForPart('办理出入库', body, script, modConfig.template);

})

// 个人备件库
router.get('/partV2/repertory/person', async ctx => {
  let script = ['/sparePart.person.js'];
  let modConfig = modules['sparePart.person'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/partV2/repertory/person', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtmlForPart('个人备件库', body, script, modConfig.template);

})

// 备件品类详情
router.get('/partV2/category/detail', async ctx => {
  let script = ['/sparePart.detail.js'];
  let modConfig = modules['sparePart.detail'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/partV2/category/detail', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtmlForPart('备件库详情', body, script, modConfig.template);

})

// 编辑备件品类 
router.get('/partV2/category/edit', async ctx => {
  let script = ['/sparePart.edit.js'];
  let modConfig = modules['sparePart.edit'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/partV2/category/edit', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtmlForPart('编辑备件', body, script, modConfig.template);

})

module.exports = router;