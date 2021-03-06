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

  ctx.body = Template.renderWithHtml('部门列表', body, script, modConfig.template)
})


router.get('/security/tag/createTag', async ctx => {
  let script = ['/team.edit.js'];
  let modConfig = modules['team.edit'];

  ctx.body = Template.renderWithData('新建部门', {}, script, modConfig.template)
})

router.get('/security/tag/createDept', async ctx => {
  let script = ['/teamV2.edit.js'];
  let modConfig = modules['teamV2.edit'];

  ctx.body = Template.renderWithData('新建部门', {}, script, modConfig.template)
})

// router.get('/security/tag/createChildrenTag', async ctx => {
//   let script = ['/team.create.js'];

//   ctx.body = Template.renderWithData('新建子部门', {}, script)
// });

router.get('/security/tag/editTag/:id', async ctx => {
  let modConfig = modules['team.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/team.edit.js'];
  let result = await HttpClient.request(`/security/tag/editTag/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑部门', body, script, modConfig.template)
})

router.get('/security/tag/editDept/:id', async ctx => {
  let modConfig = modules['teamV2.edit'];
  let reqHeaders = ctx.request.headers;
  let script = ['/teamV2.edit.js'];
  let result = await HttpClient.request(`/security/tag/editDept/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml('编辑部门', body, script, modConfig.template)
})

// router.get('/security/tag/editChildrenTag', async ctx => {
//   let script = ['/team.create.js'];

//   ctx.body = Template.renderWithData('编辑子部门', {}, script)
// });

router.get('/security/tag/view/:id', async ctx => {
  let script = ['/team.detail.js'];
  let modConfig = modules['team.detail'];
  let reqHeaders = ctx.request.headers;

  let result = await HttpClient.request(`/security/tag/editTag/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml('部门详情', body, script, modConfig.template)
})

module.exports = router;