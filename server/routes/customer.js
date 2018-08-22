const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();

router.get('/customer', async ctx => {
  let script = ['/customer.list.js'];
  ctx.body = Template.renderWithData('客户管理', {}, script)
})

module.exports = router;