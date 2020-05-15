import FormLocationSetting from './FormLocationSetting.vue';
import FormLocationPreview from './FormLocationPreview.vue';
import FormLocationView from './FormLocationView.vue';
import FormLocation from './FormLocation.vue';
import FormLocationSearch from './extend/FormLocationSearch.vue';

let FormLocationField = {
  formType: 'location', // 字段类型
  name: '位置',
  isSystem: 0,
  component: {
    build: FormLocation,
    setting: FormLocationSetting,
    preview: FormLocationPreview,
    view: FormLocationView,
    extend: {
      'location_search': FormLocationSearch
    }
  }
};

export default FormLocationField;