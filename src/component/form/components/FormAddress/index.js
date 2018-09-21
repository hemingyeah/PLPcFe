import FormAttachmentSetting from './FormAttachmentSetting.vue';
import FormAttachmentPreview from './FormAttachmentPreview.vue';
import FormAddress from './FormAddress.vue'

let FormAddressField = {
  formType: 'address', // 字段类型
  name: '地址',
  isSys: true,
  component: {
    setting: FormAttachmentSetting,
    preview: FormAttachmentPreview,
    build: FormAddress
  }
};

export default FormAddressField;