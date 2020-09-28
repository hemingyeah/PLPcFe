import Address from './../../entity/Address';
import Customer from './../../entity/Customer';
import Linkman from './../../entity/Linkman';
import Task from './../../entity/Task';

/** 
 * @description 工单创建编辑模型
*/
export interface TaskCreateAndEditModel {
  // 地址
  address ?: Address;
  // 客户
  customer ?: Customer;
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