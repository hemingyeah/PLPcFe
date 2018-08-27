import FormTextSetting from './FormTextSetting.vue';
import FormTextPreview from './FormTextPreview.vue';
import FormTextBuild from './FormTextBuild'

let FormTextField = {
  formType: 'text', // 字段类型
  name: '单行文本',
  isSys: false,
  component: {
    setting: FormTextSetting,
    preview: FormTextPreview,
    build: FormTextBuild
  }
};

export default FormTextField;


