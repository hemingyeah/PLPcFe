/* data */
import TaskAllotUserTableData from '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTableData'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import Customer from '@model/entity/Customer'
import CustomerAddress from '@model/entity/CustomerAddress'
/* interface */
import { UserState } from '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTableInterface'
/* util */
import { findComponentUpward, findComponentDownward } from '@src/util/assist'

class TaskAllotUserTableComputed extends TaskAllotUserTableData {
  /* 工单派单组件 */
  get TaskAllotModalComponent() {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* 选择列 组件 */
  get BaseTableAdvancedSettingComponent() { 
    return findComponentDownward(this, ComponentNameEnum.BaseTableAdvancedSetting)
  }
  
  /* 客户 */
  get customer(): Customer {
    return this.TaskAllotModalComponent.customer || {}
  }
  
  /* 客户地址 */
  get customerAddress(): CustomerAddress {
    return this.customer.customerAddress || new CustomerAddress()
  }
  
  /* 是否是按团队派单 */
  get isAllotByTag() {
    return this.TaskAllotModalComponent.isAllotByTag === true
  }
  
  /* 用户状态 对象 */
  get userStateMap() {
    return this.TaskAllotModalComponent?.$props?.userStateMap || {}
  }
  
  /* 用户状态 列表 */
  get userStateList(): UserState[] {
    let list: UserState[] = []
    
    for (let userStateKey in this.userStateMap) {
      let userState: UserState = {
        key: userStateKey,
        value: userStateKey,
        label: userStateKey,
        color: this.userStateMap[userStateKey]
      }
      list.push(userState)
    }
    
    return list
  }
}

export default TaskAllotUserTableComputed