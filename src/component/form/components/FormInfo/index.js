import FormInfoSetting from './FormInfoSetting.vue';
import FormInfoPreview from './FormInfoPreview.vue';
import FormInfo from './FormInfo.vue';

let FormInfoField = {
  formType: 'info',
  name: '说明信息',
  isSystem: 0,
  component: {
    setting: FormInfoSetting,
    preview: FormInfoPreview,
    build: FormInfo,
    extend: {
    }
  }
}

export default FormInfoField;
