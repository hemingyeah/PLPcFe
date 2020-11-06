import FormRelatedTaskSetting from './FormRelatedTaskSetting.vue';
import FormRelatedTaskPreview from './FormRelatedTaskPreview.vue';
import FormRelatedTask from './FormRelatedTask.vue';

let FormRelatedTaskField = {
  formType: 'related_task', // 字段类型
  name: '关联工单',
  isSystem: 0,
  component: {
    setting: FormRelatedTaskSetting,
    preview: FormRelatedTaskPreview,
    build: FormRelatedTask
  }
};

export default FormRelatedTaskField;
