const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();

router.get('/customer', async ctx => {
  let script = ['/customer.list.js'];
  ctx.body = Template.renderWithData('客户管理', {}, script)
});

router.get('/customer/create', async ctx => {
  let script = ['/customer.edit.js'];
  ctx.body = Template.renderWithData('新建客户', {}, script)
});

module.exports = router;