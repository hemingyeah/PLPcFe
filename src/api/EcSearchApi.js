import http from '@src/util/http';

function map(original) {
  const {code, message, success, result} = original;
  let nb = {
    status: code,
    success,
    message,
    list: result ? result.content || [] : []
  };
  
  return nb;
}



function searchLinkman(params) {
  return http.post('/api/search/outside/es/linkman/search', params)
    .then(res => map(res))
}
function searchCustomer(params) {
  return http.post('/api/search/outside/es/customer/search', params)
    .then(res => map(res))
}

export {
  searchLinkman,
  searchCustomer,
};