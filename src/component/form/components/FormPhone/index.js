import FormPhoneSetting from './FormPhoneSetting.vue';
import FormPhonePreview from './FormPhonePreview.vue';
import FormPhone from './FormPhone.vue';

let FormPhoneField = {
  formType: 'phone', // 字段类型
  name: '电话',
  isSystem: 0,
  component: {
    setting: FormPhoneSetting,
    preview: FormPhonePreview,
    build: FormPhone
  }
};

export default FormPhoneField;
