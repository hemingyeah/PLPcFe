import './FormSelect.scss';

import FormSelectSetting from './FormSelectSetting.vue';
import FormSelectPreview from './FormSelectPreview.vue';
import FormSelect from './FormSelect.vue';

// 产品类型
import ProductTypeExtendSetting from './extend/ProductTypeExtendSetting.vue';
// 客户团队
import CustomerTagsExtendSetting from './extend/CustomerTagsExtendSetting.vue';
import CustomerExtend from './extend/CustomerExtend.vue'
// 工单优先级
import TaskExtendSetting from './extend/TaskExtendSetting.vue';
//下拉高级搜索
import FormSelectSearch from './extend/FormSelectSearch.vue';

let FormSelectField = {
  formType: 'select', // 字段类型
  name: '下拉菜单',
  isSystem: 0,
  component: {
    setting: FormSelectSetting,
    preview: FormSelectPreview,
    build: FormSelect,
    extend: {
      'product_type_setting': ProductTypeExtendSetting,
      'customer_tags_setting': CustomerTagsExtendSetting,
      'customer_extend': CustomerExtend,
      'select_search': FormSelectSearch
    }
  }
};

let TaskLevelField = {
  formType: 'level', // 字段类型
  fieldName: 'level',
  name: '优先级',
  isSystem: 1,
  forceDelete: true,
  component: {
    preview: FormSelectPreview,
    build: FormSelect,
    extend: {
      'task_level_setting': TaskExtendSetting
    }
  }
}

const TaskServiceTypeField = {
  formType: 'serviceType',
  fieldName: 'serviceType',
  name: '服务类型',
  isSystem: 1,
  forceDelete: true,
  component: {
    preview: FormSelectPreview,
    build: FormSelect,
    extend: {
      'task_serviceType_setting': TaskExtendSetting
    }
  }
}

const TaskServiceContentField = {
  formType: 'serviceContent',
  fieldName: 'serviceContent',
  name: '服务内容',
  isSystem: 1,
  forceDelete: true,
  component: {
    preview: FormSelectPreview,
    build: FormSelect,
    extend: {
      'task_serviceContent_setting': TaskExtendSetting
    }
  }
}

export default [
  FormSelectField, 
  TaskLevelField,
  TaskServiceTypeField,
  TaskServiceContentField
];


