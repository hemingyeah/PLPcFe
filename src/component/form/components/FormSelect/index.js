import FormSelectSetting from './FormSelectSetting.vue';
import FormSelectPreview from './FormSelectPreview.vue';
import FormSelectBuild from './FormSelectBuild.vue';

let FormSelectField = {
  formType: 'select', // 字段类型
  name: '下拉菜单',
  isSys: false,
  component: {
    setting: FormSelectSetting,
    preview: FormSelectPreview,
    build: FormSelectBuild
  }
};

export default FormSelectField;


