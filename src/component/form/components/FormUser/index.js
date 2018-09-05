import FormUserSetting from './FormUserSetting.vue';
import FormUserPreview from './FormUserPreview.vue';
import FormUserBuild from './FormUserBuild.vue'

let FormUserField = {
  formType: 'user', // 字段类型
  name: '人员',
  isSys: false,
  component: {
    setting: FormUserSetting,
    preview: FormUserPreview,
    build: FormUserBuild
  }
};

export default FormUserField;