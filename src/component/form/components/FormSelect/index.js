import FormSelectSetting from './FormSelectSetting.vue';
import FormSelectPreview from './FormSelectPreview.vue';
import FormSelect from './FormSelect.vue';

let FormSelectField = {
  formType: 'select', // 字段类型
  name: '下拉菜单',
  isSystem: 0,
  component: {
    setting: FormSelectSetting,
    preview: FormSelectPreview,
    build: FormSelect
  }
};

export default FormSelectField;


