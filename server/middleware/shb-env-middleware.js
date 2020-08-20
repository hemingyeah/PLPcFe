let defaultOption = {
  isNotLocalEnv: false,
  cookie: ''
}

function shbEnvMiddleware(options = defaultOption) {
  return async function(ctx, next){
    await shbEnvMiddlewareHandler(ctx, next, options)
  }
}

async function shbEnvMiddlewareHandler(ctx, next, options) {
  let request = ctx.request;

  // 判断是否是本地环境
  if (options.isNotLocalEnv) {
    let headers = request.headers;
    // 设置cookie
    headers.cookie = options.cookie;
  } else {
    // 设置地址
    let originalUrl = request.originalUrl;

    originalUrl = (
      originalUrl.replace('/api/app', '')
        .replace('/api/search', '')
        .replace('/api/calendar', '')
        .replace('/api/payment', '')
        .replace('/api/elasticsearch', '')
    )

    request.originalUrl = originalUrl;
  }

  await next();
}


module.exports = {
  shbEnvMiddleware
}
