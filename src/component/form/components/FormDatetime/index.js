import FormDatetimeSetting from './FormDatetimeSetting.vue'
import FormDatetimePreview from './FormDatetimePreview.vue'
import FormDatetime from './FormDatetime.vue'

let FormDatetimeField = {
  formType: 'datetime', // 字段类型
  name: '日期时间',
  isSystem: 0,
  component: {
    setting: FormDatetimeSetting,
    preview: FormDatetimePreview,
    build: FormDatetime
  }
}

export default FormDatetimeField
