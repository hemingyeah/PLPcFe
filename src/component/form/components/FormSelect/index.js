import './FormSelect.scss';

import FormSelectSetting from './FormSelectSetting.vue';
import FormSelectPreview from './FormSelectPreview.vue';
import FormSelect from './FormSelect.vue';

import FormSelectSettingProductType from './FormSelectSettingProductType.vue';

let FormSelectField = {
  formType: 'select', // 字段类型
  name: '下拉菜单',
  isSystem: 0,
  component: {
    setting: FormSelectSetting,
    extends: {
      productType: FormSelectSettingProductType
    },
    preview: FormSelectPreview,
    build: FormSelect
  }
};

export default FormSelectField;


