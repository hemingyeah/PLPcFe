import FormPhoneSetting from './FormPhoneSetting.vue';
import FormPhonePreview from './FormPhonePreview.vue';
import FormPhone from './FormPhone.vue';

import PhoneSearch from './extend/PhoneSearch';

let FormPhoneField = {
  formType: 'phone', // 字段类型
  name: '电话',
  isSystem: 0,
  component: {
    setting: FormPhoneSetting,
    preview: FormPhonePreview,
    build: FormPhone,
    extend: {
      'phone_search': PhoneSearch
    }
  }
};

export default FormPhoneField;
