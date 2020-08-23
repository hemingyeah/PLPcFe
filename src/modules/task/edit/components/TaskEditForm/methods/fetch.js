/* eslint-disable no-empty-function */
/* api */
import * as TaskApi from '@src/api/TaskApi';

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