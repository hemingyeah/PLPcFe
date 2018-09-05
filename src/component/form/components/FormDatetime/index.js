import FormDatetimeSetting from './FormDatetimeSetting.vue';
import FormDatetimePreview from './FormDatetimePreview.vue';
import FormDatetimeBuild from './FormDatetimeBuild.vue'

let FormDatetimeField = {
  formType: 'datetime', // 字段类型
  name: '日期时间',
  isSys: false,
  component: {
    setting: FormDatetimeSetting,
    preview: FormDatetimePreview,
    build: FormDatetimeBuild
  }
};

export default FormDatetimeField;