/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* methods */
import TaskAllotModalMethods from '@src/modules/task/components/TaskAllotModal/TaskAllotModalMethods'
/* model */
import { TaskAllotTypeModeEnum } from '@src/modules/task/components/TaskAllotModal/TaskAllotModalModel'
/* vue */
import { VNode } from 'vue'

class TaskAllotModalRender extends TaskAllotModalMethods {
  
  /** 
   * @description 渲染工单派单头部派单选择
  */
  public renderLasTasktAllotResultButton(): VNode {
    const lastTaskAllotResultButton: VNode = (
      <el-button type='primary' plain onClick={(event: MouseEvent) => this.useLastTaskAllotResult(event)}>
        上一次派单结果
      </el-button>
    )
    const clearTaskAllotResultButton: VNode = (
      <el-button type='primary' plain onClick={(event: MouseEvent) => this.clearTaskAllotResult(event)}>
        清空结果
      </el-button>
    )
    
    return (
      <div class='task-allot-modal-result-button'>
        {
          this.showClearTaskAllotResultButton ? clearTaskAllotResultButton : lastTaskAllotResultButton
        }
      </div>
    )
  }
  
  /** 
   * @description 渲染转派说明
  */
  public renderReAllotReason(): VNode | null {
    // 转派时渲染 转派说明
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
   * @description 渲染工单派单头部
  */
  public renderTaskAllotHeader(): VNode {
    return (
      <div class='task-allot-modal-header'>
        {this.renderTaskAllotHeaderType()}
        {this.renderLasTasktAllotResultButton()}
      </div>
    )
  }
  
  /** 
   * @description 渲染工单派单头部派单方式
  */
  public renderTaskAllotHeaderType(): VNode {
    /**
     * 是否显示工单池类型
     * 1. 工单设置 -> 工单池 开启
     * 2. 且该工单目前不在工单池中
    */
    const isShowTaskPoolType: boolean = Boolean(this.taskConfig.taskPoolOn === true && !this.isTaskInTaskPool)
    /** 
     * 是否显示自动派单类型
     * 1. 工单设置 -> 自动派单 开启
     * 2. 且非转派 (仅支持指派)
    */
    const isShowAutoDispatchType: boolean = Boolean(this.taskConfig.autoDispatch === true && !this.isReAllot)
    return (
      <div class='task-allot-modal-header-type'>
        <el-radio-group value={this.allotType} onInput={(value: TaskAllotTypeEnum) => this.handlerAllotTypeChange(value)}>
          <el-radio-button label={TaskAllotTypeEnum.Person}>
            { this.isReAllot ? '转派给工单负责人' : '指派给工单负责人' }
          </el-radio-button>
          {
            isShowTaskPoolType && (
              <el-radio-button label={TaskAllotTypeEnum.Pool}>
                指派到工单池
              </el-radio-button>
            )
          }
          {
            isShowAutoDispatchType && (
              <el-radio-button label={TaskAllotTypeEnum.Auto}>
                自动分配
              </el-radio-button>
            )
          }
        </el-radio-group>
        {this.renderTaskAllotHeaderMode()}
      </div>
    )
  }
  
  /** 
   * @description 渲染工单派单头部派单模式
  */
  public renderTaskAllotHeaderMode(): VNode | null {
    // 是否开启按地图派单
    const isTaskAllotByMap: boolean = this.taskConfig.taskAllotByMap === true
    // 是否是派单到负责人
    const isAllotExecutor: boolean = this.allotType === TaskAllotTypeEnum.Person
    // 未开启按地图派单 或 非派单到负责人时不渲染
    if (!isTaskAllotByMap || !isAllotExecutor) return null
    
    return (
      <div class='task-allot-modal-header-mode'>
        <el-radio-group value={this.allotTypeMode} onInput={(value: TaskAllotTypeModeEnum) => this.handlerAllotTypeModeChange(value)}>
          <el-radio-button label={TaskAllotTypeModeEnum.List}>
            列表
          </el-radio-button>
          <el-radio-button label={TaskAllotTypeModeEnum.Map}>
            地图
          </el-radio-button>
        </el-radio-group>
      </div>
    )
  }
}

export default TaskAllotModalRender
