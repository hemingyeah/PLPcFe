import FormTextareaSetting from './FormTextareaSetting.vue';
import FormTextareaPreview from './FormTextareaPreview.vue';
import FormTextarea from './FormTextarea.vue'

import TextareaSearch from './extend/TextareaSearch';

let FormTextareaField = {
  formType: 'textarea', // 字段类型
  name: '多行文本',
  isSystem: 0,
  component: {
    setting: FormTextareaSetting,
    preview: FormTextareaPreview,
    build: FormTextarea,
    extend: {
      'textarea_search': TextareaSearch
    }
  }
};

export default FormTextareaField;


