/** 团队权限控制，用于查询团队 @author dongls */
import BaseEnum from './BaseEnum';

class TeamAuthEnum extends BaseEnum{
  constructor(){
    super()
    
    this.TASK_VIEW = {
      name: '工单查看权限',
      value: 'TASK_VIEW'
    }

    this.TASK_EDIT = {
      name: '工单编辑权限',
      value: 'TASK_EDIT'
    }

    this.TASK_DISPATCH = {
      name: '工单指派权限',
      value: 'TASK_DISPATCH'
    }

    this.CUSTOMER_VIEW = {
      name: '客户查看权限',
      value: 'CUSTOMER_VIEW'
    }

    this.CUSTOMER_EDIT = {
      name: '客户编辑权限',
      value: 'CUSTOMER_EDIT'
    }

    this.REPORT_VIEW = {
      name: '查看运营分析',
      value: 'REPORT_VIEW'
    }

    this.VIP_REPORT_VIEW = {
      name: 'VIP查看运营分析',
      value: 'VIP_REPORT_VIEW'
    }

    this.VIP_SPAREPART_PERSON = {
      name: '个人备件库',
      // 数据库中就是拼写错误的值
      value: 'VIP_SPAREPART_PERSION'
    }
  }
}

export default new TeamAuthEnum;