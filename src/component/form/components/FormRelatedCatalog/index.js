import FormRelatedSetting from './FormRelatedSetting.vue';
import FormRelatedPreview from './FormRelatedPreview.vue';

// 采用element-ui的select组件，不支持下拉加载更新，不利于后期需求拓展 (暂弃用)
// import FormRelated from './FormRelated.vue';  
import FormRelated from './FormRelatedV2.vue';

import ExtendSearch from './extend/ExtendSearch.vue';

let FormRelatedTaskField = {
  formType: 'related_catalog', // 字段类型
  name: '关联产品目录',
  isSystem: 0,
  component: {
    setting: FormRelatedSetting,
    preview: FormRelatedPreview,
    build: FormRelated,
    extend: {
      'related_catalog_search': ExtendSearch
    }
  }
};

export default FormRelatedTaskField;
