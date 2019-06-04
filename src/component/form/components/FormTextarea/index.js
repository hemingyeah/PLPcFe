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

let TaskDescriptionField = {
  formType: 'description',
  fieldName: 'level',
  name: '描述',
  isSystem: 1,
  component: {
    setting: {
      name: 'task-description-setting',
      render(){
        return <div>task description setting</div>
      }
    },
    preview: FormTextareaPreview,
    build: FormTextarea
  }
}

export default [FormTextareaField, TaskDescriptionField];


