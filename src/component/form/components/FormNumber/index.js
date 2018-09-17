import FormNumberSetting from './FormNumberSetting.vue';
import FormNumberPreview from './FormNumberPreview.vue';
import FormNumber from './FormNumber.vue'

let FormNumberField = {
  formType: 'number', // 字段类型
  name: '数字',
  isSys: false,
  component: {
    setting: FormNumberSetting,
    preview: FormNumberPreview,
    build: FormNumber
  }
};

export default FormNumberField;


