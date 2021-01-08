/** 电话类型字段，pc端表现与text一致 */
import FormEmailSetting from './FormEmailSetting.vue';
import FormEmailPreview from './FormEmailPreview.vue';
import FormEmail from './FormEmail.vue';

let FormEmailField = {
  formType: 'email', // 字段类型
  name: '邮箱',
  isSystem: 0,
  component: {
    setting: FormEmailSetting,
    preview: FormEmailPreview,
    build: FormEmail
  }
};

export default FormEmailField;
