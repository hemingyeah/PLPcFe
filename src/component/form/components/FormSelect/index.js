import './FormSelect.scss';

import FormSelectSetting from './FormSelectSetting.vue';
import FormSelectPreview from './FormSelectPreview.vue';
import FormSelect from './FormSelect.vue';

import ProductTypeExtendSetting from './extend/ProductTypeExtendSetting.vue';
import CustomerTagsExtendSetting from './extend/CustomerTagsExtendSetting.vue';
import CustomerExtend from './extend/CustomerExtend.vue'

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
      'customer_extend': CustomerExtend
    }
  }
};

let TaskLevelField = {
  formType: 'level', // 字段类型
  fieldName: 'level',
  name: '优先级',
  isSystem: 1,
  component: {
    preview: FormSelectPreview,
    build: FormSelect,
    setting: ProductTypeExtendSetting
  }
}

const TaskServiceTypeField = {
  formType: 'serviceType',
  fieldName: 'serviceType',
  name: '服务类型',
  isSystem: 1,
  component: {
    preview: FormSelectPreview,
    build: FormSelect,
    setting: ProductTypeExtendSetting
  }
}

const TaskServiceContentField = {
  formType: 'serviceContent',
  fieldName: 'serviceContent',
  name: '服务内容',
  isSystem: 1,
  component: {
    preview: FormSelectPreview,
    build: FormSelect,
    setting: ProductTypeExtendSetting
  }
}

export default [
  FormSelectField, 
  TaskLevelField,
  TaskServiceTypeField,
  TaskServiceContentField
];


