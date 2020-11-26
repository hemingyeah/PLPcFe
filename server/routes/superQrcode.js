const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/superQrcode', async ctx => {
  let script = ['/superQrcode.setting.js'];
  let modConfig = modules['superQrcode.setting'];
  
  ctx.body = Template.renderWithHtml('超级二维码', {}, script, modConfig.template)
})

module.exports = router;