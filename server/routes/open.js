const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/v_open/dailyReport', async ctx => {
  console.log('日报')
  let script = ['/open.dailyReport.js'];
  let reqHeaders = ctx.request.headers;
  let queryString = ctx.request.querystring;
  let path = `/v_open/dailyReport?${queryString}`

  //let path = '/v_open/dailyReport?tenantId=7416b42a-25cc-11e7-a500-00163e12f748&module=personal&staffId=1159676932953183&appId=3397';
  let result = await HttpClient.request(path, 'get', null, {headers: reqHeaders});
  let body = result.body;
 
  ctx.body = Template.renderWithHtml('订阅汇总信息每日通知日报', body, script)
});

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