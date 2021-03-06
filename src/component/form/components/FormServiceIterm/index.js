import FormServiceIterm from './FormServiceIterm.vue';
import FormServiceItermPreview from './FormServiceItermPreview.vue';
import FormServiceItermSetting from './FormServiceItermSetting.vue';

let FormServiceItermField = {
  formType: 'serviceIterm', // 字段类型
  fieldName: 'serviceIterm',
  name: '服务项目',
  isSystem: 1,
  forceDelete: true,
  component: {
    preview: FormServiceItermPreview,
    build: FormServiceIterm,
    extend: {
      'task_receipt_serviceIterm_setting': FormServiceItermSetting
    }
  }
};

export default FormServiceItermField;


