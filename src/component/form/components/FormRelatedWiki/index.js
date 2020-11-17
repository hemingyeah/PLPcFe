import FormRelatedWikiSetting from './FormRelatedWikiSetting.vue';
import FormRelatedWikiPreview from './FormRelatedWikiPreview.vue';
import FormRelatedWiki from './FormRelatedWiki.vue';

import WikiExtendSearch from './extend/WikiExtendSearch.vue';

let FormRelatedTaskField = {
  formType: 'related_wiki', // 字段类型
  name: '关联知识库',
  isSystem: 0,
  component: {
    setting: FormRelatedWikiSetting,
    preview: FormRelatedWikiPreview,
    build: FormRelatedWiki,
    extend: {
      'related_wiki_search': WikiExtendSearch
    }
  }
};

export default FormRelatedTaskField;
