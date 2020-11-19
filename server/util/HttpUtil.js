const https = require('https');
const chalk = require('chalk');
const chalkError = chalk.red;
// model
const MODEL_PATH = './../model';
const {
  proxyConfig,
  isNotLocalEnv,
  envMap
} = require(`${MODEL_PATH}/proxyConfigModel`);
const {
  SHB_ENV
} = require(`${MODEL_PATH}/userConfigModel`);
const {
  DEFAULT_OPIONS,
  AGENT,
  HTTPAGENT
} = require(`${MODEL_PATH}/httpConfigModel`);

/** 如果解析失败返回原值 */
function toJSON(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    console.log(chalkError(`toJson error ${err}`))
    return data;
  }
}

/**
 * 拆解返回体
 * @param {*} response @see http://nodejs.cn/api/http.html#http_class_http_serverresponse
 * @param {*} body 返回的数据
 * @param {*} error 
 */
function getBody(response, body, error) {
  let statusCode = error ? 500 : response.statusCode;
  let status = statusCode >= 200 && statusCode < 300;

  let headers = {};
  if (response && response.headers) {
    headers = response.headers;
  }

  return {
    statusCode,
    status,
    headers,
    body,
    error
  };
}

/**
 * 获取主机名字
 * @param {Object} options 配置项
 */
function getHostName(options = {}, isForce = false) {
  let hostName = '';

  try {
    hostName = isNotLocalEnv && !isForce ? proxyConfig.host : options.host;
  } catch (error) {
    console.log(chalkError('getHostName error'))
  }

  hostName = hostName || DEFAULT_OPIONS.host;

  return hostName;
}

/**
 * 获取端口
 * @param {Object} options 配置项
 */
function getPort(options = {}, isForce = false) {
  let port = '';

  try {
    port = isNotLocalEnv && !isForce ? proxyConfig.port : options.port;
  } catch (error) {
    console.log(chalkError('getPort error'))
  }

  port = port || DEFAULT_OPIONS.port;

  return port;
}

/**
 * 获取请求配置
 * @param {String} path 路径
 * @param {String} method 方法
 * @param {Object} options 配置项
 */
function getRequestOptions(path, method, options = {}) {
  let requestOptions = {};

  requestOptions.path = path;
  requestOptions.method = method;
  requestOptions.headers = Object.assign({}, isNotLocalEnv ? options.headers : DEFAULT_OPIONS.headers);

  setBaseOptions(requestOptions, options);

  return requestOptions;
}

/**
 * 获取请求配置
 * @param {Object} ctx 上下文
 * @param {Object} options 配置项
 */
function getProxyOptions(ctx, options = {}, isForce = false) {
  let proxyOptions = {};

  let request = ctx.request;
  let path = request.originalUrl;
  let method = request.method;

  proxyOptions.path = path;
  proxyOptions.method = method;

  let originHeaders = Object.assign({}, request.header, options.headers);
  let localHeaders = Object.assign({}, request.header, DEFAULT_OPIONS.headers, options.headers);
  proxyOptions.headers = Object.assign({}, isNotLocalEnv ? originHeaders : localHeaders);

  setBaseOptions(proxyOptions, options, isForce);

  return proxyOptions;
}

function setBaseOptions(originOptions = {}, options = {}, isForce = false) {
  originOptions.host = getHostName(options, isForce);
  originOptions.hostname = getHostName(options, isForce);
  originOptions.port = getPort(options, isForce);
  originOptions.agent = isForce ? HTTPAGENT : AGENT;

  delete originOptions.headers.host;
}

function getCookie() {
  let envMapData = envMap[SHB_ENV];
  let {
    user,
    location
  } = envMapData;

  let params = new URLSearchParams({
    uid: user.userId,
    tid: user.tenantId,
    corpId: user.corpId
  });
  let url = `${location}/smlogin/login?${params.toString()}`;

  const options = {
    hostname: envMap[SHB_ENV].host,
    port: '',
    path: `/smlogin/login?${params.toString()}`,
    method: 'GET',
    headers: {
      cookie: 'shbversion=shbvip;'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      // console.log('状态码:', res.statusCode);
      // console.log('请求头:', res.headers);

      let headers = res.headers;
      let cookies = headers['set-cookie'] || [];
      let cookie = `${cookies[0]};shbversion=shbvip;` || '';

      if (!cookie) {
        console.log(chalkError(`cannot get cookie form the ${SHB_ENV} environment`))
      }

      resolve(cookie);

    });


    req.on('error', (e) => {
      console.log('nodeLoginErro', e);
    });
    req.end();
  })

  // return new Promise((resolve, reject) => {
  //   https.get(url, (res) => {
  //     let headers = res.headers;
  //     let cookies = headers['set-cookie'] || [];
  //     let cookie = cookies[0] || '';

  //     if (!cookie) {
  //       console.log(chalkError(`cannot get cookie form the ${SHB_ENV} environment`))
  //     }

  //     resolve(cookie);

  //   }).on('error', (err) => {
  //     console.log(err);
  //     reject(err);
  //   });

  // })

}


module.exports = {
  toJSON,
  getBody,
  getHostName,
  getPort,
  getRequestOptions,
  getProxyOptions,
  getCookie
}