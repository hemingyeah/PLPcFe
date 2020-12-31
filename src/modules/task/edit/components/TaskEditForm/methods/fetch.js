/* eslint-disable no-empty-function */
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
import * as ProductApi from '@src/api/ProductApi';

export default {
  /** 
   * @description 通过联系人获取地址数据
  */
  fetchLmBindAddress(params) {
    return TaskApi.getLmBindAddress(params);
  },
  /** 
   * @description 获取客户/产品 关联的工单数量数据
  */
  fetchCountForCreate(params) {
    return TaskApi.getCountForCreate(params).then((result = {}) => {
      this.relevanceTaskCountData[params.module] = result;
    });
  },
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
    return ProductApi.getProductDetail(params);
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
  /** 
   * @description 关联显示项数据查询
  */
  fetchRelatedInfo(params) {
    return TaskApi.getRelatedInfos(params);
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
    return TaskApi.getAllFields(params);
  },
  /** 
   * @description 获取工单客户默认数据
  */
  fetchTaskDefaultInfo(params) {
    return TaskApi.getTaskDefaultInfo(params);
  },
}