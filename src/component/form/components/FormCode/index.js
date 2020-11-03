/** 扫码类型字段，pc端表现与text一致 */
import FormCodeSetting from './FormCodeSetting.vue';
import FormCodePreview from './FormCodePreview.vue';
import FormCode from './FormCode.vue';

let FormCodeField = {
  formType: 'code', // 字段类型
  name: '扫码',
  isSystem: 0,
  component: {
    setting: FormCodeSetting,
    preview: FormCodePreview,
    build: FormCode
  }
};

export default FormCodeField;
