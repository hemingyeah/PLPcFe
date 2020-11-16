import FormPhoneSetting from './FormPhoneSetting.vue';
import FormPhonePreview from './FormPhonePreview.vue';
import FormPhone from './FormPhone.vue';

import PhoneSearch from './extend/PhoneSearch';

import CustomerSerialNumberExtendSetting from '../FormText/extend/CustomerSerialNumberExtendSetting.vue';
import CustomerNameExtendSetting from '../FormText/extend/CustomerNameExtendSetting.vue';

import ProductSerialNumberExtendSetting from '../FormText/extend/ProductSerialNumberExtendSetting.vue';
import CustomerPhoneExtendSetting from '../FormText/extend/CustomerPhoneExtendSetting.vue';
import ProductNameExtendSetting from '../FormText/extend/ProductNameExtendSetting.vue';
import CustomerNameExtendSearch from '../FormText/extend/CustomerNameExtendSearch.vue';
import LinkmanExtendSearch from '../FormText/extend/LinkmanExtendSearch.vue';

let FormPhoneField = {
  formType: 'phone', // 字段类型
  name: '电话',
  isSystem: 0,
  component: {
    setting: FormPhoneSetting,
    preview: FormPhonePreview,
    build: FormPhone,
    extend: {
      'phone_search': PhoneSearch,
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

export default FormPhoneField;
