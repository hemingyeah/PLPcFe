/* api */
import { getCustomer, getCustomerExeinsyn } from '@src/api/CustomerApi.ts'
import { getTaskConfig } from '@src/api/TaskApi'
import { getStateColorMap } from '@src/api/SettingApi'
/* computed */
import TaskAllotModalComputed from '@src/modules/task/components/TaskAllotModal/TaskAllotModalComputed'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import TaskConfig from '@model/types/TaskConfig'
/* interface */
import { DepeMultiUserResult } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalInterface'
/* model */
import { getCustomerDetailResult } from '@model/param/out/Customer'
import { getTaskConfigResult } from '@model/param/out/Task'
/* types */
import StateColorMap from '@model/types/StateColor'

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
   * @description 删除负责人
  */
  public deleteExcutorUser(user: LoginUser) {
    this.executorUser = null
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
   * @description 获取属性列表
  */
  public getAttributes() {
    return {
      class: 'task-allot-modal',
      props: {
        title: '派单'
      },
      on: {
        'update:show': (val: any) => {
          this.showTaskAllotModal = val
        }
      },
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
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
   * @description 查询工单配置
  */
  public fetchTaskConfig() {
    return (
      getTaskConfig()
      .then((result: getTaskConfigResult) => {
        this.taskConfig = result.taskConfig || new TaskConfig()
      })
      .catch(err => {
        console.warn(err)
      })
    )
  }
  
  /** 
   * @description 根据客户id获取客户信息和客户负责人信息和开关 
  */
  public fetchSynergyUserWithCustomerManager() {
    let customerId = this.customerId
    if(!customerId) return console.warn('fetchExeinsynWithCustomerManager paramer not have customerId')
    
    getCustomerExeinsyn({ id: customerId}).then(result => {
      let exeInSynOfTaskOrEvent = result?.data?.exeInSynOfTaskOrEvent;
      // 允许自动将客户负责人带入工单或事件协同人
      if (exeInSynOfTaskOrEvent) {
        result?.data?.userId && this.synergyUserList.push(result.data)
      }
    })
    
  }
  
  /** 初始化工作状态的颜色 */
  public fetchStateColor(): Promise<any> {
    return (
      getStateColorMap()
        .then((res: StateColorMap) => {
          this.stateColorMap = res || {}
        })
        .catch(err => console.error(err))
    )
  }
  
  /** 
   * @description 派单方式变化
  */
  public handlerAllotTypeChange(type: TaskAllotTypeEnum) {
    this.allotType = type
  }
  
  /** 
   * @description 设置负责人信息
   * -- 支持外部调用的
  */
  public outsideSetExcutorUser(user: LoginUser | null) {
    this.setExecutorUser(user)
  }
  
  /** 
   * @description 设为负责人
  */
  public setExecutorUser(user: LoginUser | null) {
    this.executorUser = user
  }
  
  /** 
   * @description 设为协同人
  */
  public setSynergyUser(user: LoginUser) {
    // 判断是否已存在该用户
    const IsNotRepeat = this.synergyUserList.every(synergyUser => synergyUser.userId !== user.userId)
    IsNotRepeat && this.synergyUserList.push(user)
  }
  
  /** 
   * @description 显示弹窗
  */
  public show() {
    this.showTaskAllotModal = true
    this.fetchTaskConfig()
  }
}

export default TaskAllotModalMethods
