import FormTextareaSetting from './FormTextareaSetting.vue';
import FormTextareaPreview from './FormTextareaPreview.vue';
import FormTextarea from './FormTextarea.vue'

let FormTextareaField = {
  formType: 'textarea', // 字段类型
  name: '多行文本',
  isSystem: 0,
  component: {
    setting: FormTextareaSetting,
    preview: FormTextareaPreview,
    build: FormTextarea
  }
};

export default FormTextareaField;


