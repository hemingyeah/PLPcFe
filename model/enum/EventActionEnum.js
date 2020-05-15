/** 事件动作枚举 @author dongls */
import BaseEnum from './BaseEnum';

//TODO: 添加color字段
class EventActionEnum extends BaseEnum{
  constructor(){
    super();

    this.CREATE_INNER = {
      name: '新建',
      value: 'createInner'
    };

    this.CREATE_SELF_HELP = {
      name: '提交',
      value: 'createSelfHelp'
    };

    this.ALLOT = {
      name: '分配',
      value: 'allot'
    };

    this.START = {
      name: '开始',
      value: 'start'
    };

    this.FINISH = {
      name: '完成',
      value: 'finish'
    };
    
    this.EVALUATE = {
      name: '评价',
      value: 'evaluate'
    };

    this.REDEPLOY = {
      name: '转派',
      value: 'redeploy'
    };

    this.UPDATE = {
      name: '修改',
      value: 'update'
    };

    this.OFF = {
      name: '取消',
      value: 'off'
    };

    this.CONVERT_2_TASK = {
      name: '转为工单',
      value: 'convert2Task'
    };

    this.AUTO_DISPATCH = {
      name: '自动分配',
      value: 'autoDispatch'
    };

    this.UPDATE_SYNERGY = {
      name: '修改协同人',
      value: 'updateSynergy'
    }
    
    this.PAUSE = {
      name: '暂停',
      value: 'pause'
    }

    this.UNPAUSE = {
      name: '继续',
      value: 'unpause'
    }
  }
}

export default new EventActionEnum();