const KoaRouter = require('koa-router')
const ResultMessage = require('../../model/ResultMessage')
const HttpProxy = require('../util/HttpProxy')
const Template = require('../util/Template')

const router = new KoaRouter();

router.get('/', async ctx => {
  let data = {};
  let script = ['/system.frame.js'];

  ctx.body = Template.render(data, script)
})

router.get('/home', async ctx => {
  //let result = await HttpProxy.request('/', 'get', null, {headers: ctx.request.headers});
  //console.log(result)

  let data = {};
  let script = ['/system.home.js'];
  ctx.body = Template.render(data, script)
})

router.all('/dd/*', ctx => HttpProxy.forward(ctx))

module.exports = router;
