const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/setting/superQrcode', async ctx => {
  let script = ['/superQrcode.setting.js'];
  let modConfig = modules['superQrcode.setting'];
  let reqHeaders = ctx.request.headers;

  let result = await HttpClient.request('/setting/superQrcode', 'get', null, { headers: reqHeaders });
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('产品二维码配置', body, script, modConfig.template)
})

module.exports = router;