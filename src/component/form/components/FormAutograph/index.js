import FormAutographSetting from './FormAutographSetting.vue';
import FormAutographPreview from './FormAutographPreview.vue';
import FormAutographView from './FormAutographView.vue';
import FormAutograph from './FormAutograph.vue';
import FormAutographSearch from './extend/FormAutographSearch.vue';

let FormLocationField = {
  formType: 'autograph', // 字段类型
  name: '签名',
  isSystem: 0,
  component: {
    build: FormAutograph,
    setting: FormAutographSetting,
    preview: FormAutographPreview,
    view: FormAutographView,
    extend: {
      'location_search': FormAutographSearch
    }
  }
};

export default FormLocationField;