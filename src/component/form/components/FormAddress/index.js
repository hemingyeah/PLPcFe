import FormAddressPreview from './FormAddressPreview.vue';
import FormAddressSetting from './FormAddressSetting.vue';
import FormAddressView from './FormAddressView.vue';
import FormAddress from './FormAddress.vue'

import CustomerAddressExtendSetting from './extend/CustomerAddressExtendSetting.vue'

let FormAddressField = {
  formType: 'address', // 字段类型
  name: '地址',
  isSystem: 0,
  component: {
    setting: FormAddressSetting,
    preview: FormAddressPreview,
    build: FormAddress,
    view: FormAddressView,
    extend: {
      'customer_customerAddress': CustomerAddressExtendSetting
    }
  }
};

export default FormAddressField;