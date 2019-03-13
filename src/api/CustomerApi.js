import http from '@src/util/http';

/** 
 * 获取客户信息，用于客户编辑
 * @param {string} id - 客户id
 * @returns Promise<Customer>
 */
export function getForEdit(id) {
  return http.get('/customer/getForEdit', {id})
}

/**
 * 获取客户最新的一条可见日志
 * @param {string} customerId - 客户id
 * @returns Promise<Customer>
 */
 
export function getUpdateRecord(customerId){
  return http.get('/customer/record/latestOne', customerId)
}

