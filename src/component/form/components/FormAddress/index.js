import FormAddressPreview from './FormAddressPreview.vue';
import FormAddress from './FormAddress.vue'
import FormAddressSetting from './FormAddressSetting.vue';

let FormAddressField = {
  formType: 'address', // 字段类型
  name: '地址',
  isSystem: 0,
  component: {
    setting: FormAddressSetting,
    preview: FormAddressPreview,
    build: FormAddress
  }
};

export default FormAddressField;