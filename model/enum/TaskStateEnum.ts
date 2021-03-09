import BaseEnum from './BaseEnum';

// 工单状态
type TaskState = {
  // 背景颜色
  bgColor ?: string,
  // 颜色
  color ?: string,
  // 显示名字
  name: string,
  // 值
  value: string,
}

/** 
 * @description 工单状态枚举
 * -- 稍微重写了下，暂未拆分，兼容之前的方法
*/
class TaskStateEnum extends BaseEnum {
  
  static CREATED: TaskState = {
    bgColor: '255, 145, 0',
    color: '#FF9100',
    name: '待指派',
    value: 'created'
  }
  
  static ALLOCATED: TaskState = {
    bgColor: '68, 138, 255',
    color: '#448AFF',
    name: '已指派',
    value: 'allocated',
  };
  
  static TASK_POOL: TaskState = {
    bgColor: '19, 194, 194',
    color: '#13C2C2',
    name: '工单池',
    value: 'taskPool'
  };
  
  static ACCEPTED: TaskState = {
    bgColor: '83, 109, 254',
    color: '#536DFE',
    name: '已接受',
    value: 'accepted',
  };
  
  static PROCESSING: TaskState = {
    bgColor: '0, 145, 234',
    color: '#0091EA',
    name: '进行中',
    value: 'processing',
  };
  
  static FINISHED: TaskState = {
    bgColor: '82, 196, 26',
    color: '#52C41A',
    name: '已完成',
    value: 'finished',
  };
  
  static REFUSED: TaskState = {
    bgColor: '255, 77, 79',
    color: '#FF4D4F',
    name: '已拒绝',
    value: 'refused',
  };
  
  static COSTED: TaskState = {
    bgColor: '76, 175, 80',
    color: '#4CAF50',
    name: '已结算',
    value: 'costed',
  };
  
  static CLOSED: TaskState = {
    bgColor: '96, 125, 139',
    color: '#607D8B',
    name: '已关闭',
    value: 'closed',
  };
  
  static OFFED: TaskState = {
    bgColor: '140, 140, 140',
    color: '#8C8C8C',
    name: '已取消',
    value: 'offed',
  };
  
  static PSUSED: TaskState = {
    bgColor: '255, 77, 79',
    color: '#FF4D4F',
    name: '暂停中',
    value: 'paused',
  };
  
  static UNFINISHED: TaskState = {
    bgColor: '255, 64, 129',
    color: '#FF4081',
    name: '未完成',
    value: 'unfinished',
  };
  
  constructor() {
    super();
  }
  
  /** 
   * @description 根据 value 获取 bgColor
   * @param {String} value 值
   * @param {Number} transparency 透明度
  */
  static getBgColor(value: string, transparency?: number): string {
    const taskStateEnum: any = TaskStateEnum;
    let bgColor: string  = ''
    let state: TaskState
    
    for (let stateKey in taskStateEnum) {
      state = taskStateEnum[stateKey]
      if (state.value == value) {
        bgColor = state.bgColor || ''
        break
      }
    }
    
    // 错误提示
    if (!bgColor) console.warn('Caused: TaskStateEnum getBgColor got the value is empty')
    // 判断是否有透明度
    if (typeof transparency === 'number') {
      bgColor = `rgba(${bgColor}, ${transparency})` 
    } else {
      bgColor = `rgb(${bgColor})`
    }
    
    return bgColor;
  }
  
  /** 
   * @description 根据 value 获取 color
   * @param {String} value 值
  */
  static getColor(value: string): string {
    const taskStateEnum: any = TaskStateEnum
    let state: TaskState
    
    for (let stateKey in taskStateEnum) {
      state = taskStateEnum[stateKey]
      if (state.value == value) {
        return state.color || ''
      }
    }
    // 错误提示
    console.warn('Caused: TaskStateEnum getColor got the value is empty')
    
    return ''
  }
  
  /** 
   * @description 根据 value 获取 name
   * @param {String} value 值
  */
  static getName(value: string): string {
    const taskStateEnum: any = TaskStateEnum
    let state: TaskState
    
    for (let stateKey in taskStateEnum) {
      state = taskStateEnum[stateKey]
      if (state.value == value) {
        return state.name
      }
    }
    // 错误提示
    console.warn('Caused: TaskStateEnum getName got the value is empty')
    
    return '';
  }
  
  /** 
   * @description 根据 name 获取 value
   * @param {String} name 名字
  */
  static getValue(name: string): string {
    const taskStateEnum: any = TaskStateEnum
    let state: TaskState
    
    for (let stateKey in taskStateEnum) {
      state = taskStateEnum[stateKey]
      if (state.name == name) {
        return state.value
      }
    }
    // 错误提示
    console.warn('Caused: TaskStateEnum getValue got the value is empty')
    
    return '';
  }
  
  /** 
   * @description 根据工单状态 获取 name
   * @param {Object} task 工单数据
  */
  static getNameForTask(task: any = {}): string {
    if (task.isPaused) return TaskStateEnum.PSUSED.name;
    
    let { state } = task;
    
    return TaskStateEnum.getName(state);
  }
  
  /** 
   * @description 根据工单状态 获取 color
   * @param {Object} task 工单数据
  */
  static getColorForTask(task: any= {}): { bgColor: string, color: string} {
    let { state } = task;
    if (task.isPaused) state = TaskStateEnum.PSUSED.value;
    
    return {
      color: TaskStateEnum.getColor(state),
      bgColor: TaskStateEnum.getBgColor(state, 0.2)
    }
  }
  
  /** 
   * @description 根据工单状态 获取 value
   * @param {Object} task 工单数据
  */
  static getValueForTask(task: any= {}): string {
    if(task.isPaused) return TaskStateEnum.PSUSED.value;
    
    let { state } = task;
    
    return TaskStateEnum.getValue(state);
  }
}

export default TaskStateEnum;
