import FormDatetimeSetting from './FormDatetimeSetting.vue';
import FormDatetimePreview from './FormDatetimePreview.vue';
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
};

const TaskPlanTimeField = {
  formType: 'planTime',
  name: '计划时间',
  isSystem: 1,
  component: {
    setting: {
      name: 'task-planTime-setting',
      render(){
        return <div>task planTime setting</div>
      }
    },
    preview: {
      name: 'task-planTime-preview',
      render(){
        return <div>task planTime preview</div>
      }
    },
    build: {
      name: 'task-planTime',
      render(){
        return <div>task planTime</div>
      }
    }
  }
}

export default [
  FormDatetimeField,
  TaskPlanTimeField
];