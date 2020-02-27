import FormSparepart from './FormSparepart.vue';
import FormSparepartPreview from './FormSparepartPreview.vue';
import FormSparepartSetting from './FormSparepartSetting.vue';

let FormSparepartField = {
  formType: 'sparepart', // 字段类型
  name: '备件',
  isSystem: 0,
  component: {
    setting: FormSparepartSetting,
    preview: FormSparepartPreview,
    build: FormSparepart
  }
};

export default FormSparepartField;


