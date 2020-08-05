import FormCustomerPreview from './FormCustomerPreview';
import ProductCustomerExtendSetting from './extend/ProductCustomerExtendSetting';


let FormCustomerField = {
  formType: 'customer',
  name: '客户',
  isSystem: 1,
  component: {
    preview: FormCustomerPreview,
    extend: {
      'product_customer_setting': ProductCustomerExtendSetting
    }
  }
}

export default FormCustomerField;