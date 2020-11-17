import Address from '@model/entity/Address'
import EsTaskSearchInput from '@model/types/EsTaskSearchInput'
import Linkman from '@model/entity/Linkman'
import Task from '@model/entity/Task'

/** 
 * @description 工单创建编辑模型
*/
export interface TaskCreateAndEditModel {
  // 地址
  address ?: Address;
  // 客户
  customer ?: {
    id: string,
    name: string
  };
  // 事件id(事件转工单用)
  eventId ?: string;
  // 事件编号(事件转工单用)
  eventNo ?: string;
  flow ?: string;
  // 联系人
  linkman ?: Linkman;
  // 工单表单数据
  task ?: Task;
  // 是否需要发短信 1 需要 , 0 不需要
  tick ?: Number;
}

/** 
 * @description 计划任务创建编辑模型
*/
export interface PlanTaskCreateAndEditModel {
  // 提前几天创建,默认为0
  advance ?: string;
  // 派单设置
  allotSetting ?: {
    // 派单方式
    allotType ?: 'normal' | 'pool' | 'auto';
    // 负责人id
    executorId ?: string;
    // 协同人
    synergies ?: Object[];
  };
  // 截止设置
  endSetting ?: {
    // 截止单位
    endBy ?: 'times' | 'date';
    // 截止单位值
    value ?: string;
  };
  // 计划任务id
  id ?: number;
  // 计划任务名称
  name ?: string;
  // 周期设置
  periodSetting ?: {
    // 周期数
    period ?: string;
    // 周期单位
    periodUnit ?: '天' | '周' | '月';
  };
  // 工单表单数据
  task ?: Task;
}

export interface TaskGetCardDetailListModel {
  // 工单类型id
  typeId: string
}

/* 工单搜索列表model */
export interface TaskSearchListModel extends EsTaskSearchInput {
  // 以下都是前端使用的，不涉及后端
  orderDetail?: {
    // 是否是系统字段
    isSystem?: boolean
    // 排序方式
    sequence?: string
    // 列名
    column?: string
  } | null
  productAddress?: any
  createTime?: string
  planTime?: string
  allotTime?: string
  acceptTime?: string
  startTime?: string
  completeTime?: string
  updateTime?: string
  reviewTime?: string
  balanceTime?: string
  closeTime?: string
  allotTypeStr?: string
  tlmName?: string | null
  paymentMethods?: string[]
  tags?: any[]
  states?: string[]
  allotTypeStrs?: string[]
  onceExceptions?: string[]
  searchCondition?: string
}

/* 工单指派 查询人员列表model */
export interface TaskAllotUserListByTagModel {
  customerId: string
  lat: string | number | null
  lng: string | number | null
  tagId?: string
}

/* 自动派单-获取预估列表结果model */
export interface TaskAutoDispatchResultListModel {
  // 工单id
  taskId: string
  // 必填默认值 参数做了校验   如传入：auto_dispatch
  executorId: string
}

/* 自动派单-获取预估列表结果model */
export interface TaskUserCardSearchModel {
  // 人员id
  executorId: string
  // 开始时间 示例： 2020-10-01
  startTime: string
  // 结束时间 示例： 2020-10-01
  endTime: string
}