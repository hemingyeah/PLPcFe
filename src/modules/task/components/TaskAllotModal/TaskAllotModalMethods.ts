/* api */
import { getCustomer } from '@src/api/CustomerApi.ts'
/* computed */
import TaskAllotModalComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComputed'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* interface */
/* computed */
import { DepeMultiUserResult } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* model */
import { getCustomerDetailResult } from '@model/param/out/Customer'

class TaskAllotModalMethods extends TaskAllotModalComputed {
  /** 
   * @description 选择协同人
  */
  public chooseSynergyUser(): void {
    let options = {
      title: '请选择协同人',
      seeAllOrg: true,
      selected: this.synergyUserList,
      max: 14
    }
    
    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // 协同人赋值
        this.synergyUserList = result?.data?.users || []
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
  /** 
   * @description 删除协同人
  */
  public deleteSynergyUser(user: LoginUser) {
    this.synergyUserList = (
      this.synergyUserList
      .filter((synergyUser: LoginUser) => {
        return synergyUser.userId !== user.userId
      })
    )
  }
  
  /**
   * @description 获取客户信息
  */
  public fetchCustomer() {
    let id = this.$props.customerId
    if (!id) {
      return console.warn('Caused: TaskAllotModal fetchCustomer not have customerId')
    }
    
    getCustomer(id).then((result: getCustomerDetailResult) => {
      let isSuccess = result.status == 0
      if (!isSuccess) return
      
      this.customer = Object.freeze(result.data || {})
      
      // @ts-ignore
      this.$refs.TaskAllotExcutorComponent.outsideFetchUsers()
      
    }).catch(err => {
      console.error(err)
    })
  }
  
  /** 
   * @description 派单方式变化
  */
  public handlerAllotTypeChange(type: TaskAllotTypeEnum) {
    this.allotType = type
  }
  
  /** 
   * @description 设为负责人
  */
  setExecutorUser(user: LoginUser) {
    this.executorUser = user
  }
  
  /** 
   * @description 设为协同人
  */
  setSynergyUser(user: LoginUser) {
    this.synergyUserList.push(user)
  }
  
  /** 
   * @description 显示弹窗
  */
  public show() {
    this.showTaskAllotModal = true
  }
}

export default TaskAllotModalMethods
