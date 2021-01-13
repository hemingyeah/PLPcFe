const KoaRouter = require('koa-router');
const Template = require('../util/Template');
const HttpClient = require('../util/HttpClient')

const modules = require('../../modules');
const router = new KoaRouter();

// 转交详情
router.get('/guideForNewUser', async ctx => {
  let script = ['/guideForNewUser.js'];
  let modConfig = modules['guideForNewUser'];
  let reqHeaders = ctx.request.headers;

  // let result = await HttpClient.request(`/security/user/list/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  // let body = result.body;
  
  ctx.body = Template.renderWithHtml('引导详情', {}, script, modConfig.template)
})

module.exports = router;