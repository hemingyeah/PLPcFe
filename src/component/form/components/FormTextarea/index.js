import FormTextareaSetting from './FormTextareaSetting.vue';
import FormTextareaPreview from './FormTextareaPreview.vue';
import FormTextarea from './FormTextarea.vue'

import TextareaSearch from './extend/TextareaSearch';
import TaskDescriptionSetting from './extend/TaskDescriptionSetting.vue';

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

let TaskDescriptionField = {
  formType: 'description',
  fieldName: 'description',
  name: '描述',
  isSystem: 1,
  forceDelete: true,
  component: {
    preview: FormTextareaPreview,
    build: FormTextarea,
    extend: {
      'task_description_setting': TaskDescriptionSetting
    }
  },
}

export default [FormTextareaField, TaskDescriptionField];


