const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const modules = require('../../config/modules')
const router = new KoaRouter();

router.get('/', async ctx => {
  let modConfig = modules['system.frame'];
  let script = ['/system.frame.js'];
  let result = await HttpClient.request('/v3', 'get', null, {headers: ctx.request.headers});
  ctx.body = Template.renderWithHtml('首页', result.body, script, modConfig.template)
})

router.get('/home', async ctx => {
  let script = ['/system.home.js'];
  ctx.body = Template.renderWithData('首页', {}, script)
})

router.get('/demo', async ctx => {
  ctx.body = `hello demo`
})

router.get('/setting', async ctx => {
  ctx.body = `setting`
})

router.get('/demo2', async ctx => {
  ctx.body = `demo2`
})

router.all('/dd/*', ctx => HttpClient.proxy(ctx))
router.all('/files/*', ctx => HttpClient.proxy(ctx))

module.exports = router;
