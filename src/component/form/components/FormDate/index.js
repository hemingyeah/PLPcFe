import FormDateSetting from './FormDateSetting.vue';
import FormDatePreview from './FormDatePreview.vue';
import FormDate from './FormDate.vue'

let FormDateField = {
  formType: 'date', // 字段类型
  name: '日期',
  isSystem: 0,
  component: {
    setting: FormDateSetting,
    preview: FormDatePreview,
    build: FormDate
  }
};

export default FormDateField;