/** 工单状态枚举 */
import BaseEnum from './BaseEnum';

class TaskStateEnum extends BaseEnum{
  constructor(){
    super();

    this.CREATED = {
      name: '待指派',
      value: 'created',
      color: '#69b5f0'
    }

    this.ALLOCATED = {
      name: '已指派',
      value: 'allocated',
      color: '#1d93ed'
    }

    this.TASK_POOL = {
      name: '工单池',
      value: 'taskPool',
      color: '#00b5d3'
    }

    this.ACCEPTED = {
      name: '已接受',
      value: 'accepted',
      color: '#a2db77'
    }
    
    this.PROCESSING = {
      name: '进行中',
      value: 'processing',
      color: '#8ecb65'
    }

    this.FINISHED = {
      name: '已完成',
      value: 'finished',
      color: '#77a842'
    }
    
    this.REFUSED = {
      name: '已拒绝',
      value: 'refused',
      color: '#ef6b6b'
    }

    this.COSTED = {
      name: '已结算',
      value: 'costed',
      color: '#ff9933'
    }
    
    this.CLOSED = {
      name: '已关闭',
      value: 'closed',
      color: '#afafaf'
    }

    this.OFFED = {
      name: '已取消',
      value: 'offed',
      color: '#cecece'
    }

    this.PSUSED = {
      name: '暂停中',
      value: 'paused',
      color: '#ef6b6b'
    }
  }

  getColor(value){
    for(let prop in this){
      let o = this[prop];
      if(o.value == value) return o.color;
    }
  }

  getNameForTask(task = {}) {
    if(task.isPaused) return this.PSUSED.name;

    let { state } = task;
    
    return this.getName(state);
  }

  getColorForTask(task = {}) {
    if(task.isPaused) return this.PSUSED.color;

    let { state } = task;
    
    return this.getColor(state);
  }

  getValueForTask(task = {}) {
    if(task.isPaused) return this.PSUSED.value;

    let { state } = task;
    
    return this.getValue(state);
  }
}

export default new TaskStateEnum();