import FormAttachmentSetting from './FormAttachmentSetting.vue';
import FormAttachmentPreview from './FormAttachmentPreview.vue';
import FormAttachmentBuild from './FormAttachmentBuild.vue'

let FormAttachmentField = {
  formType: 'attachment', // 字段类型
  name: '附件',
  isSys: false,
  component: {
    setting: FormAttachmentSetting,
    preview: FormAttachmentPreview,
    build: FormAttachmentBuild
  }
};

export default FormAttachmentField;


