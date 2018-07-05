const KoaRouter = require('koa-router')
const HttpProxy = require('../util/HttpProxy')
const Template = require('../util/Template')

const modules = require('../../config/modules')
const router = new KoaRouter();

router.get('/', async ctx => {
  let modConfig = modules['system.frame'];
  let data = {};
  let script = ['/system.frame.js'];

  ctx.body = Template.render('售后宝', data, script, modConfig.template)
})

router.get('/home', async ctx => {
  //let result = await HttpProxy.request('/', 'get', null, {headers: ctx.request.headers});
  //console.log(result)

  let data = {};
  let script = ['/system.home.js'];
  ctx.body = Template.render('首页' ,data, script)
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

router.all('/dd/*', ctx => HttpProxy.forward(ctx))

module.exports = router;
