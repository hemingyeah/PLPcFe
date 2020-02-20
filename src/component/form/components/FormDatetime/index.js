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

const TaskPlanTimeField = {
  formType: 'planTime',
  name: '计划时间',
  isSystem: 1,
  setting: {
    dateType: 'dateTime'
  },
  component: {
    setting: FormDatetimeSetting,
    preview: FormDatetimePreview,
    build: FormDatetime
  }
}

export default [FormDatetimeField, TaskPlanTimeField]
