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
        this.customerInitData = res.data;
        this.renderCustomerForm(res.data);
      })
      .catch(err => console.error('error', err));
  },
  /** 
   * @description 获取产品数据
  */
  fetchProductData(cb = () => {}) {
    return TaskApi.getCreateProductData()
      .then(res => {
        this.productInitData = res.data;
        this.productFormView = this.renderProductForm(res.data);
      })
      .catch(err => console.error('error', err));
  },
}