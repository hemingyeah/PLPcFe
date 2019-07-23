import FormTextSetting from './FormTextSetting.vue';
import FormTextPreview from './FormTextPreview.vue';
import FormText from './FormText.vue';

import CustomerSerialNumberExtendSetting from './extend/CustomerSerialNumberExtendSetting.vue';
import CustomerNameExtendSetting from './extend/CustomerNameExtendSetting.vue';

import ProductSerialNumberExtendSetting from './extend/ProductSerialNumberExtendSetting.vue';
import CustomerPhoneExtendSetting from './extend/CustomerPhoneExtendSetting.vue';
import ProductNameExtendSetting from './extend/ProductNameExtendSetting.vue';
import CustomerNameExtendSearch from './extend/CustomerNameExtendSearch.vue';
import LinkmanExtendSearch from './extend/LinkmanExtendSearch.vue';

let FormTextField = {
  formType: 'text', // 字段类型
  name: '单行文本',
  isSystem: 0,
  component: {
    setting: FormTextSetting,
    preview: FormTextPreview,
    build: FormText,
    extend: {
      'customer_serialNumber_setting': CustomerSerialNumberExtendSetting,
      'customer_name_setting': CustomerNameExtendSetting,
      'product_serialNumber_setting': ProductSerialNumberExtendSetting,
      'product_name_setting': ProductNameExtendSetting,
      'customer_lmPhone_setting': CustomerPhoneExtendSetting,
      'customer_search': CustomerNameExtendSearch,
      'linkman_search': LinkmanExtendSearch,
    }
  }
};

export default FormTextField;


