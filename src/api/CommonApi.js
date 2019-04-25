import http from '@src/util/http';

function getSmsTemplate({pageSize = '100', pageNum = '1'} = {}) {
  return http.get('/vipsms/getTemplates', {pageSize, pageNum, })
}

export {
  getSmsTemplate,
};