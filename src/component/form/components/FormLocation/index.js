import FormLocationSetting from './FormLocationSetting.vue';
import FormLocationPreview from './FormLocationPreview.vue';
import FormLocation from './FormLocation.vue'

let FormDatetimeField = {
  formType: 'location', // 字段类型
  name: '位置',
  isSystem: 0,
  component: {
    setting: FormLocationSetting,
    preview: FormLocationPreview,
    build: FormLocation
  }
};

export default FormDatetimeField;