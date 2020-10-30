import FormCascaderSetting from './FormCascaderSetting.vue';
import FormCascaderPreview from './FormCascaderPreview.vue';
import FormCascader from './FormCascader.vue';

const FormCascaderField = {
  formType: 'cascader',
  name: '多级菜单',
  isSystem: 0,
  component: {
    setting: FormCascaderSetting,
    preview: FormCascaderPreview,
    build: FormCascader
  }
}

export default FormCascaderField;