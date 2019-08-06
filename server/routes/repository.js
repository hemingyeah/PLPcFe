const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/document/list', async ctx => {
  let script = ['/document.DocumentListView.js'];
  let modConfig = modules['document.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/approve', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('文档库', body, script, modConfig.template)
})

router.get('/documet/create', async ctx => {
  let script = ['/document.DocumentCreateView.js'];
  let modConfig = modules['document.create'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/documet/create', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('新建文档库', body, script, modConfig.template)
})

module.exports = router;