import FormCustomerSetting from './FormCustomerSetting.vue'
import FormCustomerPreview from './FormCustomerPreview.vue'
import FormCustomer from './FormCustomer.vue'

let FormCustomerField = {
  formType: 'customer',
  name: '客户',
  isSystem: 1,
  component: {
    setting: FormCustomerSetting,
    preview: FormCustomerPreview,
    build: FormCustomer,
  }
}

export default FormCustomerField
