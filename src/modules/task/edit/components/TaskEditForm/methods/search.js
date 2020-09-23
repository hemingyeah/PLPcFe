/* eslint-disable no-empty-function */
/* api */
import * as TaskApi from '@src/api/TaskApi.ts';
import { 
  customerAddressSelectConversion,
  customerSelectConversion,
  customerLinkmanSelectConversion,
  linkmanSelectConversion,
  productSelectConversion 
} from '@src/util/conversionFunctionUtil.ts';

export default {
  /** 
   * @description 搜索客户地址
  */
  async searchAddress(params) {
    try {
      const result = await TaskApi.getTaskCustomerAddress(params);

      if (!result || !result.data) return;

      result.list = result.data.map(address => customerAddressSelectConversion(address));
      
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

      result.list = result.list.map(customer => customerSelectConversion(customer));

      return result;

    } catch (error) {
      console.warn('task-edit-form: searchCustomer -> error', error);
    }
  },
  /** 
   * @description 搜索客户
  */
  async searchCustomerByPhone(params = {}) {
    let parameter = { phone: params.keyword }
    
    try {
      const result = await TaskApi.getCustomerByPhone(parameter);

      if (!result || !result.data) return;

      result.list = result.data.map(linkman => customerLinkmanSelectConversion(linkman))
      
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

      result.list = result.list.map(linkman => linkmanSelectConversion(linkman));
      
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

      result.list = result.list.map(product => productSelectConversion(product));
      
      return result;  

    } catch (error) {
      console.warn('task-edit-form: searchProduct -> error', error)
    }

  },
}