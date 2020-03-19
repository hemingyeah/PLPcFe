import FormAutographSetting from './FormAutographSetting.vue';
import FormAutographPreview from './FormAutographPreview.vue';
import FormAutograph from './FormAutograph.vue';

let FormLocationField = {
  formType: 'autograph', // 字段类型
  name: '电子签名',
  isSystem: 0,
  component: {
    build: FormAutograph,
    setting: FormAutographSetting,
    preview: FormAutographPreview
  }
};

let FormSystemAutographField = {
  formType: 'systemAutograph', // 字段类型
  name: '客户签名',
  isSystem: 1,
  forceDelete: true,
  component: {
    build: FormAutograph,
    setting: FormAutographSetting,
    preview: FormAutographPreview,
    extend: {
      'task_receipt_systemAutograph_setting': FormAutographSetting
    }
  }
};

export default [FormLocationField, FormSystemAutographField];