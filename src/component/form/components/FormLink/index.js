import FormLinkSetting from './FormLinkSetting.vue';
import FormLinkPreview from './FormLinkPreview.vue';
import FormLink from './FormLink.vue';


let FormLinkField = {
  formType: 'link', // 字段类型
  name: '超链接',
  isSystem: 0,
  component: {
    setting: FormLinkSetting,
    preview: FormLinkPreview,
    build: FormLink,
    extend: {
    }
  }
};

export default FormLinkField;


