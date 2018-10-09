import FormUserSetting from './FormUserSetting.vue';
import FormUserPreview from './FormUserPreview.vue';
import FormUser from './FormUser.vue'

let FormUserField = {
  formType: 'user', // 字段类型
  name: '人员',
  isSystem: 0,
  component: {
    setting: FormUserSetting,
    preview: FormUserPreview,
    build: FormUser
  }
};

export default FormUserField;