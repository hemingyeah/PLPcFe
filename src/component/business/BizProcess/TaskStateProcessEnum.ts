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

  constructor(){

    this.CREATED = {
      name: '待分配',
      value: 'created'
    }

    this.ALLOCATED = {
      name: '已指派',
      value: 'allocated'
    }

    this.ACCEPTED = {
      name: '已接受',
      value: 'accepted'
    }
    
    this.PROCESSING = {
      name: '进行中',
      value: 'processing'
    }

    this.FINISHED = {
      name: '已完成',
      value: ['finished', 'costed', 'closed']
    }

  }

}

export default new TaskStateProcessEnum();