const KoaRouter = require('koa-router');
const Template = require('../util/Template');
const HttpClient = require('../util/HttpClient')

const modules = require('../../modules');
const router = new KoaRouter();

// 呼叫中心设置
router.get('/callcenter/setting', async ctx => {
  let script = ['/callcenter.index.js'];
  let modConfig = modules['callcenter.index'];
  let reqHeaders = ctx.request.headers;

  // let result = await HttpClient.request(`/security/user/list/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  // let body = result.body;
  
  ctx.body = Template.renderWithHtml('呼叫中心设置', {}, script, modConfig.template)
})

// 呼叫中心
router.get('/callcenter/stage', async ctx => {
  let script = ['/callcenter.stage.js'];
  let modConfig = modules['callcenter.index'];
  let reqHeaders = ctx.request.headers;

  // let result = await HttpClient.request(`/security/user/list/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  // let body = result.body;
  
  ctx.body = Template.renderWithHtml('呼叫中心', {}, script, modConfig.template)
})

// 呼叫中心通话记录详情
router.get('/callcenter/view', async ctx => {
  let script = ['/callcenter.view.js'];
  let modConfig = modules['callcenter.view'];
  let reqHeaders = ctx.request.headers;

  // let result = await HttpClient.request(`/security/user/list/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  // let body = result.body;
  
  ctx.body = Template.renderWithHtml('通话详情', {}, script, modConfig.template)
})

// 呼叫工作台
router.get('/callcenter/workbench', async ctx => {
  let script = ['/callcenter.workbench.js'];
  let modConfig = modules['callcenter.index'];
  let reqHeaders = ctx.request.headers;

  // let result = await HttpClient.request(`/security/user/list/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  // let body = result.body;
  
  ctx.body = Template.renderWithHtml('呼叫工作台', {}, script, modConfig.template)
})

module.exports = router;