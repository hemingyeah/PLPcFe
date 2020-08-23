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