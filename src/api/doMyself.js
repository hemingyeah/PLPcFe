import http from '@src/util/http';
let urlHead = '/api/weixin';


export function getToastWxList(params) {
  return http.post('/outside/weixin/msg/getTemplateMsgList', params)
}


// toast/com/message.vue
export function getTemplates(params = {}) {
  return http.get('/vipsms/getTemplates', params)
}

export function getRecords(params = {}) {
  return http.get("/vipsms/getRecords", params)
}

// toast/com/wxMessage.vue
export function getTemplateMessageList(params = {}) {
  return http.post(`${urlHead}/outside/weixin/msg/getTemplateMsgList`, params)
}

// wxSet/com/menuset.vue
export function getMenuListWx(params = {}) {
  return http.get(`${urlHead}/outside/weixin/api/getMenuList`, params)
}

export function setMenuListWx(params = {}) {
  return http.post(
    `${urlHead}/outside/weixin/api/saveMenuList`,
    params,
    false
  )
}

//  wxSet/com/serArrItemRight.vue

export function changeTypes(params = {}) {
  return http.post(`${urlHead}/outside/weixin/setting/changeTypes`, params, false)
}

export function wxMessageSave(params = {}) {
  return http.post(`${urlHead}/outside/weixin/setting/wxMessage/save`, params, false)
}

//  wxSet/com/toastTemplate.vue

export function getToastTemplateList(params = {}) {
  return http.get(`${urlHead}/outside/weixin/api/getTemplateList`, params)
}

export function setToastTemplateList(params = {}) {
  return http.get(`${urlHead}/outside/weixin/api/saveTemplate`, params)
}

//  wxSet/wxSet.vue

export function getAuthInfoWX(params = {}) {
  return http.get(`${urlHead}/outside/weixin/api/getAuthInfo`, params)
}

export function saveWxMessage(params = {}) {
  return http.post(`${urlHead}/outside/weixin/setting/wxMessage/save`, params, false)
}

export function eventTypeList(params = {}) {
  return http.get(`${urlHead}/outside/weixin/setting/message/eventTypeList`, params)
}

export function taskTypeList(params = {}) {
  return http.get(`${urlHead}/outside/weixin/setting/message/taskTypeList`, params)
}

export function saveSendTime(params = {}) {
  return http.post(`${urlHead}/outside/weixin/setting/saveSendTime`, params, false)
}

export function cancleAuthorizer(params = {}) {
  return http.post(`${urlHead}/outside/weixin/api/cancleAuthorizer`, params, false)
}


