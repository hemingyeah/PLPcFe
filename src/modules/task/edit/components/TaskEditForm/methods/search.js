/* eslint-disable no-empty-function */
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';

export default {
  /** 
   * @description 搜索客户地址
  */
  async searchAddress(params) {
    try {
      const result = await TaskApi.getTaskCustomerAddress(params);

      if (!result || !result.data) return;

      result.list = result.data.map(address =>
        Object.freeze({
          label: address.province + address.city + address.dist + address.address,
          value: address.id,
          ...address
        })
      );
      
      return result;  

    } catch (error) {
      console.warn('task-edit-form: searchAddress -> error', error)
    }

  },
  /** 
   * @description 搜索客户
  */
  async searchCustomer(params = {}) {
    try {
      const result = await TaskApi.getTaskCustomerList(params);

      if (!result || !result.list) return;

      result.list = result.list.map(customer =>
        Object.freeze({
          label: customer.name,
          value: customer.id,
          ...customer
        })
      )

      return result;

    } catch (error) {
      console.warn('task-edit-form: searchCustomer -> error', error);
    }
  },
  /** 
   * @description 搜索客户
  */
  async searchCustomerByPhone(params = {}) {
    try {
      const result = await TaskApi.getCustomerByPhone(params);

      if (!result || !result.data) return;

      result.list = result.data.map(item => {
        let { customer, id, isMain, name, phone } = item;
        let label = `姓名：${name} 电话：${phone} 客户：${customer && customer.name}`;
        return Object.freeze({ customer, id, isMain, name, phone, label, value: id });
      })
      
      return result;

    } catch (error) {
      console.warn('task-edit-form: searchCustomer -> error', error);
    }
  },
  /** 
   * @description 搜索联系人
  */
  async searchLinkman(params = {}) {
    try {
      const data = await TaskApi.getTaskCustomerLinkman(params);
      
      let result = data.result;
      
      if (!result || !result.list) return;

      result.list = result.list.map(linkman =>
        Object.freeze({
          label: linkman.name + linkman.phone,
          value: linkman.id,
          ...linkman
        })
      );
      
      return result;  

    } catch (error) {
      console.warn('task-edit-form: searchProduct -> error', error);
    }

  },
  /** 
   * @description 搜索产品
  */
  async searchProduct(params = {}) {
    try {
      const result = await TaskApi.getTaskCustomerProduct(params);

      if (!result || !result.list) return;

      result.list = result.list.map(template =>
        Object.freeze({
          label: template.name,
          value: template.id,
          ...template
        })
      );
      
      return result;  

    } catch (error) {
      console.warn('task-edit-form: searchProduct -> error', error)
    }

  },
}