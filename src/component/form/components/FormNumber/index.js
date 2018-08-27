import FormNumberSetting from './FormNumberSetting.vue';
import FormNumberPreview from './FormNumberPreview.vue';
import FormNumberBuild from './FormNumberBuild'

let FormNumberField = {
  formType: 'number', // 字段类型
  name: '数字',
  isSys: false,
  component: {
    setting: FormNumberSetting,
    preview: FormNumberPreview,
    build: FormNumberBuild
  }
};

export default FormNumberField;


