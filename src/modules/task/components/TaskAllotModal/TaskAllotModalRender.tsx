/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* methods */
import TaskAllotModalMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotModalMethods'
import { VNode } from 'vue'

class TaskAllotModalRender extends TaskAllotModalMethods {
  /** 
   * @description 渲染工单派单类型
  */
  public renderTaskAllotType(): VNode {
    // 作用域插槽
    const scopedSlots: { [x: string]: ((y: Function) => VNode) | undefined } = {}
    
    // 未开启工单池
    if (!(this.taskConfig.taskPoolOn === true) || this.isTaskInTaskPool) {
      scopedSlots.taskPool = this.renderTaskAllotTypeTaskPool(this.isTaskInTaskPool)
    }
    
    // 未开启自动派单 或 转派
    if (!(this.taskConfig.autoDispatch === true) || this.isReAllot) {
      scopedSlots.autoDispatch = this.renderTaskAllotAutoDispatch(this.isReAllot)
    }
    
    return (
      <task-allot-type
        scopedSlots={scopedSlots}
        type={this.allotType}
        taskConfig={this.taskConfig}
        onChange={(value: TaskAllotTypeEnum) => this.handlerAllotTypeChange(value)}
      />
    )
  }
  
  /** 
   * @description 渲染工单派单类型 工单池
  */
  public renderTaskAllotTypeTaskPool(isTaskInTaskPool: boolean = false): (x: Function) => VNode {
    let content = isTaskInTaskPool ? '该工单已在工单池中，无法再次发布' : '尚未启用工单池派单功能，如需开启请到 系统管理-工单功能设置中配置' 
    
    const taskPoolSlot = (props: Function): VNode => {
      return (
        <el-tooltip content={content}  placement='top'>
          {props(true)}
        </el-tooltip>
      )
    }
    
    return taskPoolSlot
  }
  
  /** 
   * @description 渲染工单派单类型 自动派单
   * @param {Boolean} isReAllot 是否是转派
  */
  public renderTaskAllotAutoDispatch(isReAllot: boolean = false): (x: Function) => VNode {
    let content = isReAllot ? '转派工单时无法使用自动分配规则' : '尚未启用自动分配功能，如需开启请到 系统管理-工单设置中开启「启用自动分配规则」设置'
    
    const autoDispatchSlot = (props: Function): VNode => {
      return (
        <el-tooltip content={content}  placement='top'>
          {props(true)}
        </el-tooltip>
      )
    }
    
    return autoDispatchSlot
  }
  
  /** 
   * @description 渲染负责人
  */
  public renderExcutor(): VNode | null {
    if (this.allotType !== TaskAllotTypeEnum.Person) return null
    
    return (
      <div class='task-allot-executor'>
        <span class='task-allot-nav-title'>负责人</span>
        {
          this.executorUser
          ? <user-button user={this.executorUser} userDeleteFunc={(user: LoginUser) => this.deleteExcutorUser(user)} />
          : <div class='task-allot-executor-placeholder'>请在右侧选择</div>
        }
      </div>
    )
  }
  
  /** 
   * @description 渲染协同人
  */
  public renderSynergy(): VNode | null {
    // 是否可以修改协同人
    if (!this.allowModifySynergyUser) {
      return null
    }
    
    return (
      <div class='task-allot-synergy'>
        <span class='task-allot-nav-title'>选择工单协同人</span>
        <div class='task-allot-synergy-list'>
          {
            this.synergyUserList.map((synergyUser: LoginUser, index: number) => {
              return (
                <div class='task-allot-synergy-list-item'>
                  <user-button user={synergyUser} userDeleteFunc={(user: LoginUser) => this.deleteSynergyUser(user)} /> 
                  { index < this.synergyUserList.length - 1 ? <span>+</span> : null }
                </div>
              )
            })
          }
          {
            this.synergyUserList.length < this.maxSynergyUserCount
            && (
              <user-button
                class={['last-user-button', this.synergyUserList.length % 2 == 0 ? 'empty-user-button' : '']} 
                onClick={() => this.chooseSynergyUser()} 
              />
            )
          }
        </div>
      </div>
    )
  }
  
  /** 
   * @description 渲染转派说明
  */
  public renderReAllotReason(): VNode | null {
    if (!this.isReAllot) return null
    
    return (
      <div class='task-allot-reason'>
        <span class='task-allot-nav-title'>转派说明</span>
        <el-input
          type='textarea'
          rows={5}
          placeholder={`${this.reallotRemarkNotNull ? '[必填]' : '[选填]'}转派说明`}
          value={this.reason}
          onInput={(value: string) => this.reason = value}
        />
      </div>
    )
  }
}

export default TaskAllotModalRender
