const KoaRouter = require('koa-router');
const Template = require('../util/Template');
const HttpClient = require('../util/HttpClient')

const modules = require('../../modules');
const router = new KoaRouter();

router.get('/security/tag', async ctx => {
  let modConfig = modules['team.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/team.list.js'];
  let result = await HttpClient.request('/security/tag', 'get', null, { headers: reqHeaders });
  let body = result.body;

  ctx.body = Template.renderWithHtml('团队列表', body, script, modConfig.template)
})


router.get('/security/tag/createTag', async ctx => {
  let script = ['/team.edit.js'];
  let modConfig = modules['team.edit'];

  ctx.body = Template.renderWithData('新建团队', {}, script, modConfig.template)
})

router.get('/security/tag/createTagV2', async ctx => {
  let script = ['/teamV2.edit.js'];
  let modConfig = modules['teamV2.edit'];

  ctx.body = Template.renderWithData('新建部门', {}, script, modConfig.template)
})

// router.get('/security/tag/createChildrenTag', async ctx => {
//   let script = ['/team.create.js'];

//   ctx.body = Template.renderWithData('新建子团队', {}, script)
// });

router.get('/security/tag/editTag/:id', async ctx => {
  let modConfig = modules['team.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/team.edit.js'];
  let result = await HttpClient.request(`/security/tag/editTag/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑团队', body, script, modConfig.template)
})

router.get('/security/tag/editTagV2/:id', async ctx => {
  let modConfig = modules['teamV2.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/teamV2.edit.js'];
  let result = await HttpClient.request(`/security/tag/editTagV2/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑部门', body, script, modConfig.template)
})

// router.get('/security/tag/editChildrenTag', async ctx => {
//   let script = ['/team.create.js'];

//   ctx.body = Template.renderWithData('编辑子团队', {}, script)
// });

router.get('/security/tag/view/:id', async ctx => {
  let script = ['/team.detail.js'];
  let modConfig = modules['team.detail'];
  let reqHeaders = ctx.request.headers;

  let result = await HttpClient.request(`/security/tag/editTag/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('团队详情', body, script, modConfig.template)
})

router.get('/security/tag/viewV2/:id', async ctx => {
  let script = ['/teamV2.detail.js'];
  let modConfig = modules['teamV2.detail'];
  let reqHeaders = ctx.request.headers;

  let result = await HttpClient.request(`/security/tag/editTagV2/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('部门详情', body, script, modConfig.template)
})

module.exports = router;