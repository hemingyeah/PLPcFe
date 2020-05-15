// 审批列表的导出请求 请求方式与传参方式与普通导出差异太大，后期可能优化暂时独立出来

import ApproveExport from './ApproveExport.vue';

ApproveExport.install = function(Vue){
  Vue.component(ApproveExport.name, ApproveExport);
};

export default ApproveExport;
