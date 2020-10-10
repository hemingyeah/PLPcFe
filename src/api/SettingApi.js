import http from '@src/util/HttpUtil';

/** 
 * 获取版本号  
 * 1为老版本(vip版) 2基础版本 3企业版本
*/
export function getSettingEdition(params = {}) {
  return new Promise((resolve, reject) => {
    resolve({
      'status': 0,
      'message': 'ok',
      'data': {
        'edition': 2
      }
    })
  })
  // return http.get('setting/edition', params)
}