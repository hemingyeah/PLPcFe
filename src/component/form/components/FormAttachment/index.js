import FormAttachmentSetting from './FormAttachmentSetting.vue';
import FormAttachmentPreview from './FormAttachmentPreview.vue';
import FormAttachmentView from './FormAttachmentView.vue';
import FormAttachment from './FormAttachment.vue';

let FormAttachmentField = {
  formType: 'attachment', // 字段类型
  name: '附件',
  isSystem: 0,
  component: {
    setting: FormAttachmentSetting,
    preview: FormAttachmentPreview,
    build: FormAttachment,
    view: FormAttachmentView
  }
};

const TaskAttachmentField = {
  formType: 'taskAttachment',
  fieldName: 'attachment',
  name: '附件',
  isSystem: 1,
  forceDelete: true,
  component: {
    preview: FormAttachmentPreview,
    build: FormAttachment,
    view: FormAttachmentView,
    extend: {
      setting: FormAttachmentSetting
    }
  }
}

export default [FormAttachmentField, TaskAttachmentField];


