import FormSparepart from './FormSparepart.vue';
import FormSparepartPreview from './FormSparepartPreview.vue';
import FormSparepartSetting from './FormSparepartSetting.vue';

let FormSparepartField = {
  formType: 'sparepart', // 字段类型
  name: '备件',
  isSystem: 1,
  component: {
    preview: FormSparepartPreview,
    build: FormSparepart,
    extend: {
      'task_sparepart_setting': FormSparepartSetting
    }
  }
};

export default FormSparepartField;


