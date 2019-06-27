import http from '@src/util/http';

function searchLinkman(params) {
  return http.post('/api/search/outside/es/linkman/search', params)
}
function searchCustomer(params) {
  return http.post('/api/search/outside/es/customer/search', params)
}

export {
  searchLinkman,
  searchCustomer,
};