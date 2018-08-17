import FormTextSetting from './FormTextSetting.vue';
import FormTextPreview from './FormTextPreview.vue';

export default {
  formType: 'text', // 字段类型
  name: '单行文本',
  component: {
    setting: FormTextSetting,
    preview: FormTextPreview,
    build: {}
  }
}


