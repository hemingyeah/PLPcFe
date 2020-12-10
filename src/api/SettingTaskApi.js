import http from '@src/util/HttpUtil';

/* ------------- start 附加组件设置 ---------------- */

/**
 * @description 通过组件id获取附加组件信息
 * @param {Object} params -- 参数对象
 * @param {String} params.id -- 组件id
 */
export const getCardInfo =  (params = {}) => {
  return http.get('/setting/task/card/getOne', params)
}

/* ------------- end 附加组件设置 ---------------- */