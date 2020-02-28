import FormDateSetting from './FormDateSetting.vue'
import FormDatePreview from './FormDatePreview.vue'
import FormDate from './FormDate.vue'

import DateSearch from './extend/DateSearch.vue'

let FormDateField = {
  formType: 'date', // 字段类型
  name: '日期',
  isSystem: 0,
  component: {
    setting: FormDateSetting,
    preview: FormDatePreview,
    build: FormDate,
    extend: {
      date_search: DateSearch
    }
  }
}
const TaskPlanTimeField = {
  formType: 'planTime',
  name: '计划时间',
  isSystem: 1,
  setting: {
    dateType: 'date'
  },
  component: {
    setting: FormDateSetting,
    preview: FormDatePreview,
    build: FormDate
  }
}
export default [FormDateField, TaskPlanTimeField]
