import FormTextSetting from './FormTextSetting.vue';
import FormTextPreview from './FormTextPreview.vue';
import FormText from './FormText.vue';

import CustomerSerialNumberExtendSetting from './extend/CustomerSerialNumberExtendSetting.vue';
import CustomerNameExtendSetting from './extend/CustomerNameExtendSetting.vue';

import ProductSerialNumberExtendSetting from './extend/ProductSerialNumberExtendSetting.vue';

let FormTextField = {
  formType: 'text', // 字段类型
  name: '单行文本',
  isSystem: 0,
  component: {
    setting: FormTextSetting,
    preview: FormTextPreview,
    build: FormText,
    extend: {
      // 'customer_serialNumber': CustomerSerialNumberExtendSetting,
      // 'customer_name': CustomerNameExtendSetting,
      // 'product_serialNumber': ProductSerialNumberExtendSetting
    }
  }
};

export default FormTextField;


