import FormCustomerSetting from './FormCustomerSetting.vue'
import FormCustomerPreview from './FormCustomerPreview.vue'
import FormCustomer from './FormCustomer.vue'
import ProductCustomerExtendSetting from './extend/ProductCustomerExtendSetting';
import TaskCustomerExtendSetting from './extend/TaskCustomerExtendSetting';


let FormCustomerField = {
  formType: 'customer',
  name: '客户',
  isSystem: 1,
  component: {
    setting: FormCustomerSetting,
    preview: FormCustomerPreview,
    build: FormCustomer,
    extend: {
      'product_customer_setting': ProductCustomerExtendSetting,
      'task_customer_setting': TaskCustomerExtendSetting
    }
  }
}


export default FormCustomerField;

