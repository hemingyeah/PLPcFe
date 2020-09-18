import TaskStateEnum from './../../../../model/enum/TaskStateEnum';

type TaskState = {
  name: string,
  value: string | string[]
}

class TaskStateProcessEnum {

  CREATED: TaskState
  ALLOCATED: TaskState
  ACCEPTED: TaskState
  PROCESSING: TaskState
  FINISHED: TaskState
  OFFED: TaskState

  constructor(){

    this.CREATED = {
      name: '待分配',
      value: [
        TaskStateEnum.CREATED.value, 
        TaskStateEnum.TASK_POOL.value,
        TaskStateEnum.REFUSED.value
      ]
    }

    this.ALLOCATED = {
      name: '已指派',
      value: TaskStateEnum.ALLOCATED.value
    }

    this.ACCEPTED = {
      name: '已接受',
      value: TaskStateEnum.ACCEPTED.value
    }
    
    this.PROCESSING = {
      name: '进行中',
      value: TaskStateEnum.PROCESSING.value
    }

    this.FINISHED = {
      name: '已完成',
      value: [
        TaskStateEnum.FINISHED.value,
        TaskStateEnum.COSTED.value,
        TaskStateEnum.CLOSED.value
      ]
    }

    this.OFFED = {
      name: '已取消',
      value: TaskStateEnum.OFFED.value
    }

  }

}

export default new TaskStateProcessEnum();