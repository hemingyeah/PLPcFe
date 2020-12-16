import FormRelatedTaskSetting from './FormRelatedTaskSetting.vue';
import FormRelatedTaskPreview from './FormRelatedTaskPreview.vue';

// 采用element-ui的select组件，不支持下拉加载更新，不利于后期需求拓展 (暂弃用)
// import FormRelatedTask from './FormRelatedTask.vue';  
import FormRelatedTask from './FormRelatedTaskV2.vue';

import TaskExtendSearch from './extend/TaskExtendSearch.vue';

let FormRelatedTaskField = {
  formType: 'related_task', // 字段类型
  name: '关联工单',
  isSystem: 0,
  component: {
    setting: FormRelatedTaskSetting,
    preview: FormRelatedTaskPreview,
    build: FormRelatedTask,
    extend: {
      'related_task_search': TaskExtendSearch
    }
  }
};

export default FormRelatedTaskField;
