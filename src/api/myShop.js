import http from '@src/util/http';
let headeUrl = ''

export function getRules(params) {
  return http.get(`${headeUrl}/linkc/getRules`, params)
}

export function saveRules(params) {
  return http.post(`${headeUrl}/linkc/saveRules`, params)
}

export function getInfos(params) {
  return http.get(`${headeUrl}/linkc/getInfos`, params)
}

export function saveInfos(params) {
  return http.post(`${headeUrl}/linkc/saveInfos`, params)
}

export function weChat(params) {
  return http.post(`${headeUrl}/linkc/weChat`, params)
}

export function orderList(params) {
  return http.post(`${headeUrl}/linkc/order/list`, params)
}

export function orderNum() {
  return http.get(`${headeUrl}/linkc/order/num`)
}

export function orderDetail(params) {
  return http.get(`${headeUrl}/linkc/order/detail`, params)
}

export function orderDeliver(params) {
  return http.post(`${headeUrl}/linkc/order/deliver`, params)
}

export function getEventList(params) {
  return http.get(`${headeUrl}/linkc/getEventList`, params)
}

