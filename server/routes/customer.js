const KoaRouter = require('koa-router')
const HttpClient = require('../util/HttpClient')
const Template = require('../util/Template')

const router = new KoaRouter();
const modules = require('../../modules');

router.get('/customer', async ctx => {
    let script = ['/customer.list.js'];
    let modConfig = modules['customer.list'];
    let reqHeaders = ctx.request.headers;
    let result = await HttpClient.request('/customer', 'get', null, { headers: reqHeaders });
    let body = result.body;

    ctx.body = Template.renderWithHtml('客户管理', body, script, modConfig.template)
});

router.get('/customer/create', async ctx => {
    let modConfig = modules['customer.edit'];
    let reqHeaders = ctx.request.headers;
    let script = ['/customer.edit.js'];
    let result = await HttpClient.request('/customer/create', 'get', null, { headers: reqHeaders });
    let body = result.body;

    ctx.body = Template.renderWithHtml('新建客户', body, script, modConfig.template)
});

router.get('/customer/edit/:id', async ctx => {
    let modConfig = modules['customer.edit'];
    let reqHeaders = ctx.request.headers;
    let script = ['/customer.edit.js'];
    let result = await HttpClient.request(`/customer/edit/${ctx.params.id}`, 'get', null, { headers: reqHeaders });
    let body = result.body;

    ctx.body = Template.renderWithHtml('编辑客户', body, script, modConfig.template)
});

router.get('/event/createCustomer_v2', async ctx => {
    let modConfig = modules['customer.edit'];
    let reqHeaders = ctx.request.headers;
    let script = ['/customer.edit.js'];
    let result = await HttpClient.request(`/event/createCustomer_v2?eventId=${ctx.query.eventId}&goTo=${ctx.query.goTo}`, 'get', null, { headers: reqHeaders });
    let body = result.body;

    ctx.body = Template.renderWithHtml('新建客户', body, script, modConfig.template)
});

router.get('/customer/view/:id', async ctx => {
    let modConfig = modules['customer.view'];
    let reqHeaders = ctx.request.headers;
    let script = ['/customer.view.js'];
    let result = await HttpClient.request(`/customer/view/${ctx.params.id}`, 'get', null, { headers: reqHeaders });

    let body = result.body;
    ctx.body = Template.renderWithHtml('客户信息', body, script, modConfig.template)
});

router.get('/customer/createOnTask', async ctx => {
    let modConfig = modules['customer.edit.modal'];
    let reqHeaders = ctx.request.headers;
    let script = ['/customer.edit.modal.js'];
    let result = await HttpClient.request('/customer/createOnTask', 'get', null, { headers: reqHeaders });
    let body = result.body;

    ctx.body = Template.renderWithHtml('新建客户', body, script, modConfig.template)
});

router.get('/customer/createOnEvent', async ctx => {
    let modConfig = modules['customer.edit.modal'];
    let reqHeaders = ctx.request.headers;
    let script = ['/customer.edit.modal.js'];
    let result = await HttpClient.request('/customer/createOnTask', 'get', null, { headers: reqHeaders });
    let body = result.body;

    ctx.body = Template.renderWithHtml('新建客户', body, script, modConfig.template)
});

module.exports = router;