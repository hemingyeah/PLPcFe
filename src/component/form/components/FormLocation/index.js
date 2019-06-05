import FormLocationSetting from './FormLocationSetting.vue';
import FormLocationPreview from './FormLocationPreview.vue';
import FormLocationView from './FormLocationView.vue';
import FormLocation from './FormLocation.vue'

let FormLocationField = {
  formType: 'location', // 字段类型
  name: '位置',
  isSystem: 0,
  component: {
    setting: FormLocationSetting,
    preview: FormLocationPreview,
    view: FormLocationView,
  }
};

export default FormLocationField;