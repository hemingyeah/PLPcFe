import Vue from '@src/common/entry';

import CustomerEditView from '@src/modules/customer/editForModal/CustomerEditView.vue';
import EditModal from '@src/modules/product/EditModal.vue';

export default {
  /** 
   * @description 渲染客户表单
  */
  renderCustomerForm(data) {
    this.customerFormView = new Vue({
      el: '#createCustomerView',
      provide: {
        initData: Object.freeze(data)
      },
      components: {
        [CustomerEditView.name]: CustomerEditView
      },
      render(h) {
        return (
          <customer-edit-view ref="CustomerCreateView" />
        )
      }
    })
  },
  /** 
   * @description 渲染客户表单
  */
  renderProductForm(data) {
    return new Vue({
      el: '#createProductView',
      provide: {
        initData: Object.freeze(data)
      },
      components: {
        [EditModal.name]: EditModal
      },
      render(h) {
        return (
          <product-edit ref="ProductCreateView" />
        )
      }
    })
  },
}