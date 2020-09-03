const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/task', async ctx => {
  let script = ['/task.list.js'];
  let modConfig = modules['task.list'];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request('/task', 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('工单列表', body, script, modConfig.template)
});

router.get('/task/create', async ctx => {
  let modConfig = modules['task.edit'];
  let script = ['/task.edit.js'];

  ctx.body = Template.renderWithData('新建工单', {}, script, modConfig.template)
});

router
  .get('/task/edit', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/task/edit/:id', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/task/edit4CallCenter', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/task/copyTask', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/task/planTask/edit', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/task/planTask/create', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/task/planTask/create', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/task/planTask/edit', async ctx => {
    await taskEditContent(ctx);
  })
  .get('/event/convent2Task/jump', async ctx => {
    await taskEditContent(ctx);
  });
  
router.get('/task/view/:id', async ctx => {
  let modConfig = modules['task.view'];
  let reqHeaders = ctx.request.headers;
  let script = ['/task.view.js'];

  let url = `/task/view/${ctx.params.id}`;
  let result = await HttpClient.request(url, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('工单详情', body, script, modConfig.template)
});

async function taskEditContent(ctx) {
  let modConfig = modules['task.edit'];
  let script = ['/task.edit.js'];

  let { url, headers} = ctx.request;
  let result = await HttpClient.request(url, 'get', null, { headers });
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('', body, script, modConfig.template)
}

module.exports = router;