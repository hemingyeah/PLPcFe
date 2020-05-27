const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/doMyself/:type', async ctx => {
  let script = ['/doMyself.home.js'];
  let modConfig = modules['doMyself.home'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request(`/doMyself/${ctx.params.type}`, 'get', null, { headers: reqHeaders });
  let body = result.body;
  // let type = ctx.params.type;
  // let title = {
  //   'wx-set': '公众号设置',
  //   'toast-list': '消息记录'
  // }

  ctx.body = Template.renderWithHtml('自助门户设置', body, script, modConfig.template)
});

module.exports = router;
