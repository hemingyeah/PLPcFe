import FormServiceIterm from './FormServiceIterm.vue';
import FormServiceItermPreview from './FormServiceItermPreview.vue';
import FormServiceItermSetting from './FormServiceItermSetting.vue';

let FormServiceItermField = {
  formType: 'serviceIterm', // 字段类型
  name: '服务项目',
  isSystem: 1,
  component: {
    preview: FormServiceItermPreview,
    build: FormServiceIterm,
    extend: {
      'task_serviceIterm_setting': FormServiceItermSetting
    }
  }
};

export default FormServiceItermField;


