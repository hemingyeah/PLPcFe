/** development server @author dongls */

// 当前用户的配置
const argv = require("../../script/argv")(process.argv.slice(2));
const user = argv.user || "dongls";
const USER_CONFIG = require(`../../script/config/${user}`);

const KoaRouter = require("koa-router");
const HttpClient = require("../util/HttpClient");
const Template = require("../util/Template");

const modules = require("../../modules");
const router = new KoaRouter();

const customerRouter = require("./customer");
const openRouter = require("./open");
const settingRouter = require("./setting");
const teamRouter = require("./team");
const performanceRouter = require("./performance");
const productRouter = require("./product");
const approveRouter = require("./approve");
const dataScreenRouter = require("./dataScreen");

const repositoryRouter = require("./repository");
const BillRouter = require("./bill");
const jobtransferRouter = require("./jobtransfer");
const callCenterRouter = require("./callcenter");
const doMyselft = require("./doMyself");
const customerContact = require("./customerContact");
const taskRouter = require("./task");
const sparePartRouter = require("./sparePart");

const linkcRouter = require("./linkc")
const productV2Router = require("./productV2")

router.get("/", async (ctx) => {
  let modConfig = modules["system.frame"];
  let script = ["/system.frame.js"];
  let reqHeaders = ctx.request.headers;
  let headers = {};
  let body = null;
  let result = await HttpClient.request("/", "get", null, {
    headers: reqHeaders,
  });

  // 请求失败,模拟登陆
  if (!result.status) {
    console.warn("请求失败");
    let mockUser = USER_CONFIG.loginUser;
    let userToken = "dev_corpId";
    if (null != mockUser) {
      userToken = `${mockUser.userId}_${mockUser.tenantId}`;
    }

    let loginRes = await HttpClient.request(
      `/dd/mockLogin?code=dev_code&corpId=${userToken}`,
      "get",
      null
    );
    if (loginRes.status) {
      let cookie = loginRes.headers["set-cookie"] || {};
      headers["set-cookie"] = cookie;
      reqHeaders["cookie"] = cookie[0];

      // 再次请求
      result = await HttpClient.request("/", "get", null, {
        headers: reqHeaders,
      });
    } else {
      console.log(loginRes);
    }
  }

  headers = Object.assign(headers, result.headers);
  body = result.body;

  // 补全headers
  for (let name in headers) {
    ctx.response.set(name, headers[name]);
  }

  // 返回html
  ctx.body = Template.renderWithHtml(
    "售后宝",
    body,
    script,
    modConfig.template
  );
});

router.get("/demo", async (ctx) => {
  let script = ["/system.demo.js"];
  ctx.body = Template.renderWithData("demo", {}, script);
});

router.get("/performance/list", async (ctx) => {
  ctx.redirect("/performance/v2/report");
});

router.get("/window", async (ctx) => {
  let script = ["/window.js"];
  ctx.body = Template.renderWithData("window", {}, script);
});

router.use("/outside/weixin/*", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.56.211",
    port: 10007,
    headers: {
      cookie:
        "VIPPUBLINKJSESSIONID=08928ba0-ea31-4ac5-a411-bf8611a8ac44; __wpkreporterwid_=864b663e-6aec-4645-3a39-06e795e7bb67; JSESSIONID=63A6296AD52983C1B1C997923E46783E",
    },
  })
);

router.use("/outside/es/task/search", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10006,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/task/editBatchTask", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/view/getUserViews", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/es/task/getTaskCountByState", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10006,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/view/getOneView", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/view/createTaskView", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/view/editTaskView", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/view/deleteOneView", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/customer/getSimpleCustomerList", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.57.130",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

router.use("/outside/pc/task/delete", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.59.137",
    port: 10012,
    headers: {
      cookie: "VIPPUBLINKJSESSIONID=2ba8534c-7d9b-4791-b18c-003257139446",
    },
  })
);

// 通知中心改造
router.use("/outside/*", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.59.106",
    port: 10002,
    headers: {
      cookie:
        "VIPPUBLINKJSESSIONID=f560fed5-4bc4-4ff0-8638-e6666c18a31a; JSESSIONID=5442CD36355252A20E2CC1DAB778E536; __wpkreporterwid_=a99f79d5-3645-407a-3bf8-d6774e411773",
    },
  })
);

router.use("/approve/search", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "47.98.255.79",
    port: 10002,
  })
);
router.use("/api/customer/outside/pc", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.58.216",
    port: 10013,
  })
);

router.use("/api/customer/outside/es", (ctx) =>
  HttpClient.proxy(ctx, {
    host: "30.40.58.216",
    port: 10006,
  })
);

router.use("", performanceRouter.routes());
router.use("", customerRouter.routes(), customerRouter.allowedMethods());
router.use("", openRouter.routes(), openRouter.allowedMethods());
router.use("", settingRouter.routes(), settingRouter.allowedMethods());
router.use("", teamRouter.routes(), teamRouter.allowedMethods());
router.use("", productRouter.routes(), productRouter.allowedMethods());
router.use("", approveRouter.routes(), productRouter.allowedMethods());
router.use("", dataScreenRouter.routes(), dataScreenRouter.allowedMethods());
router.use("", repositoryRouter.routes(), repositoryRouter.allowedMethods());
router.use("", BillRouter.routes(), BillRouter.allowedMethods());
router.use("", jobtransferRouter.routes(), jobtransferRouter.allowedMethods());
router.use("", callCenterRouter.routes(), callCenterRouter.allowedMethods());
router.use("", doMyselft.routes(), doMyselft.allowedMethods());
router.use("", customerContact.routes(), customerContact.allowedMethods());
router.use("", taskRouter.routes(), taskRouter.allowedMethods());
router.use("", sparePartRouter.routes(), sparePartRouter.allowedMethods());
router.use("", linkcRouter.routes(), sparePartRouter.allowedMethods());
router.use("", productV2Router.routes(), sparePartRouter.allowedMethods());

router.all("/*", (ctx) => {
  return HttpClient.proxy(ctx);
});

module.exports = router;
