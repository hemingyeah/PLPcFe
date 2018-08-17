import FormSelectSetting from './FormSelectSetting.vue';
import FormSelectPreview from './FormSelectPreview.vue';

export default {
  formType: 'select', // 字段类型
  name: '下拉菜单',
  component: {
    setting: FormSelectSetting,
    preview: FormSelectPreview,
    build: {}
  }
}


