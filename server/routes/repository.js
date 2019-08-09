const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/document/list', async ctx => {
  let script = ['/document.list.js'];
  let modConfig = modules['document.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/document/list', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('文档库', body, script, modConfig.template)
})

router.get('/document/create', async ctx => {
  let script = ['/document.create.js'];
  let modConfig = modules['document.create'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/document/create', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('新建文档库', body, script, modConfig.template)
})

router.get('/document/detail', async ctx => {
  let script = ['/document.detail.js'];
  let modConfig = modules['document.detail'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/document/detail', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('文档库详情', body, script, modConfig.template)
})

router.get('/bulletin/list', async ctx => {
  let script = ['/bulletin.list.js'];
  let modConfig = modules['bulletin.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/bulletin/list', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('通知公告', body, script, modConfig.template)
})

router.get('/bulletin/create', async ctx => {
  let script = ['/bulletin.create.js'];
  let modConfig = modules['bulletin.create'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/bulletin/create', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('新建通知公告', body, script, modConfig.template)
})

router.get('/bulletin/detail', async ctx => {
  let script = ['/bulletin.detail.js'];
  let modConfig = modules['bulletin.detail'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/bulletin/detail', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('通知公告详情', body, script, modConfig.template)
})

module.exports = router;