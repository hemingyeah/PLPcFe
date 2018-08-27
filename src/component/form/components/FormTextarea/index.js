import FormTextareaSetting from './FormTextareaSetting.vue';
import FormTextareaPreview from './FormTextareaPreview.vue';
import FormTextareaBuild from './FormTextareaBuild.vue'

let FormTextareaField = {
  formType: 'textarea', // 字段类型
  name: '多行文本',
  isSys: false,
  component: {
    setting: FormTextareaSetting,
    preview: FormTextareaPreview,
    build: FormTextareaBuild
  }
};

export default FormTextareaField;


