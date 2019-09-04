const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/wiki/list/page', async ctx => {
  let script = ['/document.list.js'];
  let modConfig = modules['document.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/wiki/list/page', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('知识库', body, script, modConfig.template)
})

router.get('/wiki/create/page', async ctx => {
  let script = ['/document.create.js'];
  let modConfig = modules['document.create'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/wiki/create/page', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('新建文档', body, script, modConfig.template)
})

router.get('/wiki/edit/page', async ctx => {
  let script = ['/document.create.js'];
  let modConfig = modules['document.create'];
  let reqHeaders = ctx.request.headers;

  const wikiId = ctx.request.query.wikiId;
  let result = await HttpClient.request(`/wiki/edit/page?id=${wikiId}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('编辑文档', body, script, modConfig.template)
})

router.get('/wiki/detail/page', async ctx => {
  let script = ['/document.detail.js'];
  let modConfig = modules['document.detail'];
  let reqHeaders = ctx.request.headers;

  const wikiId = ctx.request.query.wikiId;
  let result = await HttpClient.request(`/wiki/detail/page?id=${wikiId}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('知识库', body, script, modConfig.template)
})

router.get('/info/notice/list/page', async ctx => {
  let script = ['/bulletin.list.js'];
  let modConfig = modules['bulletin.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/info/notice/list/page', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('通知公告', body, script, modConfig.template)
})

router.get('/info/notice/create/page', async ctx => {
  let script = ['/bulletin.create.js'];
  let modConfig = modules['bulletin.create'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/info/notice/create/page', 'post', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('新建通知公告', body, script, modConfig.template)
})

router.get('/info/notice/detail/page', async ctx => {
  let script = ['/bulletin.detail.js'];
  let modConfig = modules['bulletin.detail'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/info/notice/detail/page', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('通知公告', body, script, modConfig.template)
})

router.get('/share/wiki/view', async ctx => {
  let script = ['/open.wiki.js'];
  let modConfig = modules['open.wiki'];
  let reqHeaders = ctx.request.headers;
  const wikiId = ctx.request.query.wikiId;

  let result = await HttpClient.request( `/share/wiki/view?wikiId=${wikiId}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
 
  ctx.body = Template.renderWithHtml('知识库分享', body, script, modConfig.template)
});

module.exports = router;