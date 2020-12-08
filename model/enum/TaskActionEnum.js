/** 工单动作枚举 @author dongls */
import BaseEnum from './BaseEnum';

class TaskActionEnum extends BaseEnum{
  constructor(){
    super();

    this.CREATE = {
      name: '新建',
      value: 'create'
    };

    this.START = {
      name: '开始',
      value: 'start'
    };

    this.UPDATE = {
      name: '修改',
      value: 'update'
    };

    this.ADD = {
      name: '更新',
      value: 'add'
    }

    this.ALLOT = {
      name: '指派',
      value: 'allot'
    };

    this.REDEPLOY = {
      name: '转派',
      value: 'redeploy'
    };

    this.ACCEPT = {
      name: '接受',
      value: 'accept'
    }

    this.REFUSE = {
      name: '拒绝',
      value: 'refuse'
    }

    this.OFF = {
      name: '取消',
      value: 'off'
    };

    this.FINISH = {
      name: '完成',
      value: 'finish'
    };

    this.CLOSE = {
      name: '关闭',
      value: 'close'
    }
    
    this.ROLLBACK = {
      name: '回退',
      value: 'rollBack'
    }

    this.COST = {
      name: '结算',
      value: 'cost'
    }

    this.REVIEW = {
      name: '回访并关闭',
      value: 'review'
    }

    this.AUTOREVIEW = {
      name: '自动回访',
      value: 'autoReview'
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

export default new TaskActionEnum();