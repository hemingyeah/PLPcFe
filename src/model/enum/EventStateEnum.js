import BaseEnum from './BaseEnum';

class EventStateEnum extends BaseEnum{
  constructor(){
    super();

    this.CREATED = {
      name: '待分配',
      value: 'created'
    };

    this.ALLOCATED = {
      name: '待处理',
      value: 'allocated'
    };

    this.PROCESSING = {
      name: '处理中',
      value: 'processing'
    };
    
    this.FINISHED = {
      name: '已完成',
      value: 'finished'
    };

    this.OFFED = {
      name: '已取消',
      value: 'offed'
    };


    this.CONVERT_2_TASK = {
      name: '转工单',
      value: 'convert2Task'
    }
  }
}

export default new EventStateEnum();