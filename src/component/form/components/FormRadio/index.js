import FormRadio from './FormRadio.vue'
import FormRadioSetting from './FormRadioSetting.vue';
import FormRadioPreview from './FormRadioPreview.vue';

let FormRadioField = {
  formType: 'radio', // 字段类型
  name: '单选框',
  isSystem: 0,
  component: {
    setting: FormRadioSetting,
    preview: FormRadioPreview,
    build: FormRadio
  }
};

export default FormRadioField;
