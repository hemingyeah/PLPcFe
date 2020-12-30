import FormNumberSetting from './FormNumberSetting.vue';
import FormNumberPreview from './FormNumberPreview.vue';
import FormNumber from './FormNumber.vue'

import NumberSearch from './extend/NumberSearch.vue';

let FormNumberField = {
  formType: 'number', // 字段类型
  name: '数字',
  isSystem: 0,
  component: {
    setting: FormNumberSetting,
    preview: FormNumberPreview,
    build: FormNumber,
    extend: {
      'number_search': NumberSearch
    }
  }
};

export default FormNumberField;


