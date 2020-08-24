import FormPlantimeSetting from './FormPlantimeSetting.vue'
import FormPlantimePreview from './FormPlantimePreview.vue'
import FormPlantime from './FormPlantime.vue'

const TaskPlanTimeField = {
  formType: 'planTime',
  fieldName: 'fieldName',
  name: '计划时间',
  isSystem: 1,
  component: {
    preview: FormPlantimePreview,
    build: FormPlantime,
    extend: {
      'task_planTime_setting': FormPlantimeSetting
    }
  }
}

export default TaskPlanTimeField
