const KoaRouter = require("koa-router")
const HttpClient = require("../util/HttpClient")
const Template = require("../util/Template")

const router = new KoaRouter();
const modules = require("../../modules");
router.get("/productV2/catalog/edit", async ctx => {
  let script = ["/productV2.catalog.index.js"];
  let modConfig = modules["productV2.catalog.index"];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request("/productV2/catalog/edit", "get", null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml("产品类型管理", body, script, modConfig.template)
});
router.get("/productV2/catalog/list", async ctx => {
  //  指定id M_PRODUCT_CATALOG
  let script = ["/productV2.catalog.list.js"];
  let modConfig = modules["productV2.catalog.list"];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request("/productV2/catalog/list", "get", null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml("产品类型列表", body, script, modConfig.template)
});

router.get("/productV2/catalog/view", async ctx => {
  let script = ["/productV2.catalog.view.js"];
  let modConfig = modules["productV2.catalog.view"];
  let reqHeaders = ctx.request.headers;
  let url = `/task/view/${ctx.params.id}`;
  let result = await HttpClient.request(url, "get", null, {headers: reqHeaders});
  let body = result.body;
  ctx.body = Template.renderWithHtml("产品类型详情", body, script, modConfig.template)
});


router.get("/setting/productV2/catalog/setting", async ctx => {
  let script = ["/productV2.catalog.setting.js"];
  let modConfig = modules["productV2.catalog.setting"];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request("/setting/productV2/catalog/setting", "get", null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml("产品类型设置", body, script, modConfig.template)
});

router.get("/setting/productV2/settingField", async ctx => {
  let script = ["/productV2.settingField.js"];
  let modConfig = modules["productV2.settingField"];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request("/setting/productV2/settingField", "get", null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml("产品表单设置", body, script, modConfig.template)
});

router.get("/setting/productV2/catalog/settingField", async ctx => {
  let script = ["/productV2.catalog.settingField.js"];
  let modConfig = modules["productV2.catalog.settingField"];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request("/setting/productV2/catalog/settingField", "get", null, {
    headers: reqHeaders
  });
  let body = result.body;
  ctx.body = Template.renderWithHtml("产品类型表单设置", body, script, modConfig.template)
});

router.get("/productV2/catalog/view/:id", async ctx => {
  let script = ["/productV2.catalog.view.js"];
  let modConfig = modules["productV2.catalog.view"];
  let reqHeaders = ctx.request.headers;
  
  let result = await HttpClient.request(`/customer/product/view/${ctx.params.id}`, "get", null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml("产品类型详情", body, script, modConfig.template)
});


/** start 产品 */
router.get("/customer/productV2", async ctx => {
  let script = ["/productV2.list.js"];
  let modConfig = modules["productV2.list"];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request("/customer/product", "get", null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml("产品管理", body, script, modConfig.template)
});

router.get("/customer/product/viewV2/:id", async ctx => {
  let script = ["/productV2.view.js"];
  let modConfig = modules["productV2.view"];
  let reqHeaders = ctx.request.headers;
  
  let result = await HttpClient.request(`/customer/product/view/${ctx.params.id}`, "get", null, {headers: reqHeaders});
  let body = result.body;
  
  ctx.body = Template.renderWithHtml("产品详情", body, script, modConfig.template)
});

router.get("/customer/product/createV2", async ctx => {
  

  let modConfig = modules["productV2.edit"];
  let script = ["/productV2.edit.js"];

  
  let reqHeaders = ctx.request.headers;
  
  const customerId = ctx.request.query.customerId;
  
  let result = await HttpClient.request(`/customer/product/create?customerId=${customerId}`, "get", null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml("新建产品", body, script, modConfig.template)
});

router.get("/customer/product/editV2/:id", async ctx => {

  let modConfig = modules["productV2.edit"];
  let script = ["/productV2.edit.js"];
  let reqHeaders = ctx.request.headers;
  let result = await HttpClient.request(`/customer/product/edit/${ctx.params.id}`, "get", null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml("编辑产品", body, script, modConfig.template)
});

router.get("/product/createOnTaskV2", async ctx => {

  let modConfig = modules["productV2.edit"];
  let script = ["/productV2.edit.js"];
  let reqHeaders = ctx.request.headers;
  // let result = await HttpClient.request(`/customer/product/edit/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let result = await HttpClient.request("/product/createOnTask", "get", null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml("编辑产品", body, script, modConfig.template)
});

router.get("/product/createOnEventV2", async ctx => {
  let modConfig = modules["productV2.edit.modal"];
  let script = ["/productV2.edit.modal.js"];
  
  let reqHeaders = ctx.request.headers;
  // let result = await HttpClient.request(`/customer/product/edit/${ctx.params.id}`, 'get', null, {headers: reqHeaders});
  let result = await HttpClient.request("/product/createOnTask", "get", null, {headers: reqHeaders});
  let body = result.body;

  ctx.body = Template.renderWithHtml("编辑产品", body, script, modConfig.template)
});

/** end 产品 */



module.exports = router;