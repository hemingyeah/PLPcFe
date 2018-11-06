import FormSeparator from './FormSeparator.vue';
import FormSeparatorPreview from './FormSeparatorPreview.vue';
import FormSeparatorSetting from './FormSeparatorSetting.vue';

let FormSeparatorField = {
  formType: 'separator', // 字段类型
  name: '分割线',
  isSystem: 0,
  component: {
    setting: FormSeparatorSetting,
    preview: FormSeparatorPreview,
    build: FormSeparator
  }
};

export default FormSeparatorField;


