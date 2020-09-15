/** 工单状态枚举 */
import BaseEnum from './BaseEnum';

class TaskStateEnum extends BaseEnum{
  constructor(){
    super();

    this.CREATED = {
      name: '待指派',
      value: 'created',
      color: '#FA8C16'
    }

    this.ALLOCATED = {
      name: '已指派',
      value: 'allocated',
      color: '#FAAE14'
    }

    this.TASK_POOL = {
      name: '工单池',
      value: 'taskPool',
      color: '#13C2C2'
    }

    this.ACCEPTED = {
      name: '已接受',
      value: 'accepted',
      color: '#FAAE14'
    }
    
    this.PROCESSING = {
      name: '进行中',
      value: 'processing',
      color: '#FAAE14'
    }

    this.FINISHED = {
      name: '已完成',
      value: 'finished',
      color: '#67C23A'
    }
    
    this.REFUSED = {
      name: '已拒绝',
      value: 'refused',
      color: '#F56C6C'
    }

    this.COSTED = {
      name: '已结算',
      value: 'costed',
      color: '#67C23A'
    }
    
    this.CLOSED = {
      name: '已关闭',
      value: 'closed',
      color: '#999999'
    }

    this.OFFED = {
      name: '已取消',
      value: 'offed',
      color: '#999999'
    }

    this.PAUSED = {
      name: '暂停中',
      value: 'paused',
      color: '#F56C6C'
    }
  }

  getColor(value){
    for(let prop in this){
      let o = this[prop];
      if(o.value == value) return o.color;
    }
  }

  getNameForTask(task = {}) {
    if (task.isPaused) return this.PAUSED.name;

    let { state } = task;

    return this.getName(state);
  }

  getColorForTask(task = {}) {
    if (task.isPaused) return this.PAUSED.color;

    let { state } = task;

    return this.getColor(state);
  }

  getValueForTask(task = {}) {
    if (task.isPaused) return this.PAUSED.value;

    let { state } = task;

    return this.getValue(state);
  }
}

export default new TaskStateEnum();