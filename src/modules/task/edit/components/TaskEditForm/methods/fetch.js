/* eslint-disable no-empty-function */
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  /** 
   * @description 获取客户数据
  */
  fetchCustomerData () {
    return TaskApi.getCreateCustomerData()
      .then(res => {
        let isSuccess = res.status == 0;

        if(isSuccess) {
          this.customerInitData = res.data;
          this.customerFormView = this.renderCustomerForm(res.data);
        } else {
          this.$platform.alert(res.message);
        }

      })
      .catch(err => console.error('error', err));
  },
  /** 
   * @description 根据产品获取客户数据
  */
  fetchCustomerByProduct(params) {
    return TaskApi.getCustomerByProduct(params);
  },
  /** 
   * @description 通过联系人获取地址数据
  */
  fetchLmBindAddress(params) {
    return TaskApi.getLmBindAddress(params);
  },
  /** 
   * @description 关联显示项数据查询
  */
  fetchRelatedInfo(params) {
    return TaskApi.getRelatedInfo(params);
  },
  /** 
   * @description 获取工单类型数据
  */
  fetchTaskTypes () {
    return TaskApi.getTaskTypes()
      .then(res => {
        // this.selectedType = this.taskTypes[0] || {};
      })
      .catch(err => console.error('error', err));
  },
  /** 
   * @description 获取工单类型字段列表
  */
  fetchTaskTemplateFields(params) {
    return TaskApi.getRelatedInfo(params);
  },
  /** 
   * @description 获取工单客户默认数据
  */
  fetchTaskDefaultInfo(params) {
    return TaskApi.getTaskDefaultInfo(params);
  },
  /** 
   * @description 获取产品数据
  */
  fetchProductData(cb = () => {}) {
    return TaskApi.getCreateProductData()
      .then(res => {

        let isSuccess = res.status == 0;

        if(isSuccess) {
          this.productInitData = res.data;
          this.productFormView = this.renderProductForm(res.data);
        } else {
          this.$platform.alert(res.message);
        }

      })
      .catch(err => console.error('error', err));
  },
}