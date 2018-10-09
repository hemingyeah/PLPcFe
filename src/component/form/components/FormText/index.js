import FormTextSetting from './FormTextSetting.vue';
import FormTextPreview from './FormTextPreview.vue';
import FormText from './FormText.vue'

let FormTextField = {
  formType: 'text', // 字段类型
  name: '单行文本',
  isSystem: 0,
  component: {
    setting: FormTextSetting,
    preview: FormTextPreview,
    build: FormText
  }
};

export default FormTextField;


