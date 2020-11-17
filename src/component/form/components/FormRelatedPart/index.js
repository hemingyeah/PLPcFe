import FormRelatedPartSetting from './FormRelatedPartSetting.vue';
import FormRelatedPartPreview from './FormRelatedPartPreview.vue';
import FormRelatedPart from './FormRelatedPart.vue';

import PartExtendSearch from './extend/PartExtendSearch.vue';

let FormRelatedTaskField = {
  formType: 'related_part', // 字段类型
  name: '关联备件',
  isSystem: 0,
  component: {
    setting: FormRelatedPartSetting,
    preview: FormRelatedPartPreview,
    build: FormRelatedPart,
    extend: {
      'related_part_search': PartExtendSearch
    }
  }
};

export default FormRelatedTaskField;
