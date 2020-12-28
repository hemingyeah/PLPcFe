/* components */
import BizCallCenterPhone from '@src/component/business/BizCallCenterPhone/BizCallCenterPhone.tsx'
import BizModifyPlanTime from '@src/component/business/BizModifyPlanTime/BizModifyPlanTime.tsx'
import UiTaskState from '@src/component/ui/UiTaskState/UiTaskState.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import DateFormatEnum from '@model/enum/DateFormatEnum'
import {TaskFieldNameMappingEnum} from '@model/enum/FieldMappingEnum'
/* entity */
import Field from '@model/entity/Field'
import TaskType from '@model/entity/TaskType'
/* vue */
import VC from '@model/VC'
import {Component, Emit, Prop} from 'vue-property-decorator'
import {CreateElement, VNode} from 'vue'
/* util */
import {openTabForCustomerView, openTabForTaskView} from '@src/util/business/openTab'
import {fmt_address} from '@src/filter/fmt'
import {formatDate, isEmpty} from '@src/util/lang'
import Log from '@src/util/log.ts'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskMapInfoWindow/TaskMapInfoWindow.scss'

/* 工单地图信息弹窗数据 */
class TaskMapInfoData {
  address = {}
  customerName: string = ''
  customerId: string = ''
  description: string = ''
  isTimeout: boolean = false
  linkMan: { name?: string, phone?: string } = { name: '', phone: '' }
  planTime: string = ''
  serviceType: string = ''
  serviceContent: string = ''
  taskId: string = ''
  taskNo: string = ''
  
  constructor(data: any = {}) {
    this.address = data?.address || data?.taddress || {}
    this.customerName = data?.customerName || data?.customer?.name || data?.customerEntity?.name || ''
    this.customerId = data?.customer?.id || data?.customerEntity?.id || ''
    this.description = data?.description || ''
    this.isTimeout = data?.isTimeout || false
    this.linkMan = data?.linkMan || data.linkman || { name: data.tlmName, phone: data.tlmPhone }
    this.planTime = data?.planTime || ''
    this.serviceType = data?.serviceType || ''
    this.serviceContent= data?.serviceContent || ''
    this.taskId = data?.taskId || data?.id || data?.taskUUID || ''
    this.taskNo = data?.taskNo || ''
  }
}

enum TaskMapInfoWindowEmitEventNameEnum {
  Close = 'close',
  PlanTimeChange = 'planTimeChange'
}

@Component({ 
  name: ComponentNameEnum.TaskMapInfoWindow,
  components: {
    BizCallCenterPhone,
    BizModifyPlanTime,
    UiTaskState
  }
})
export default class TaskMapInfoWindow extends VC {
  
  /* 计划时间字段 */
  @Prop() planTimeField: Field | undefined
  /* 是否显示 */
  @Prop({ default: true }) show: boolean | undefined
  /* 是否显示修改计划时间 */
  @Prop({ default: false }) showModifyPlanTime: boolean | undefined
  /* 工单信息 */
  @Prop() task: any | undefined
  /* 工单信息 */
  @Prop() taskType: TaskType | undefined
  
  /* 工单地图信息弹窗数据 */
  get taskMapInfoData(): TaskMapInfoData {
    return new TaskMapInfoData(this.task)
  }
  
  /* 工单类型字段列表 */
  get taskTypeFields(): any {
    return this.taskType?.field || {}
  }
  
  /* 是否存在服务内容字段 */
  get isHaveServiceContentField(): boolean {
    return this.existsField(TaskFieldNameMappingEnum.ServiceContent)
  }
  
  /* 是否存在服务类型字段 */
  get isHaveServiceTypeField(): boolean {
    return this.existsField(TaskFieldNameMappingEnum.ServiceType)
  }
  
  /* 是否存在优先级字段 */
  get isHaveLevelField(): boolean {
    return this.existsField(TaskFieldNameMappingEnum.Level)
  }
  
  /** 
   * @description 计划时间修改完成事件
  */
  @Emit(TaskMapInfoWindowEmitEventNameEnum.PlanTimeChange)
  private planTimeChangedHandler(planTime: string) {
    Log.succ(Log.Start, `TaskMapInfoWindow -> ${this.planTimeChangedHandler.name}`)
    return planTime
  }
  
  /**
   * @description 关闭弹窗
   */
  @Emit(TaskMapInfoWindowEmitEventNameEnum.Close)
  private closedHandler() {
    Log.succ(Log.Start, `TaskMapInfoWindow -> ${this.closedHandler.name}`)
  }
  
  /**
   * @description 是否存在某个字段
   */
  private existsField(fieldName: TaskFieldNameMappingEnum) {
    // 是否存在
    let isExists: boolean = false
    try {
      let field: any
      for (let index in this.taskTypeFields) {
        // 字段
        field = this.taskTypeFields[index]
        // 是否相等
        isExists = field?.name === fieldName
        if (isExists) break
      }
    } catch (error) {
      isExists = false
      Log.error(error, this.existsField.name)
    }
    
    return isExists
  }
  
  /**
   * @description 渲染提示通用字段
   * @param {Boolean} show 是否显示
   * @param {String} fieldName 字段名称
   * @param {String} value 字段值
   */
  private renderSystemField(show: boolean, fieldName: string, value: string): VNode | null {
    if (!show) return null
    
    let isEmptyValue = isEmpty(value)
    let valueDom = <span>{ value || '' }</span>
    
    return (
      <p>
        <label>{fieldName}：</label>
        {
          isEmptyValue
            ? valueDom
            : (
              <el-tooltip content={value} placement='top'>
                {valueDom}
              </el-tooltip>
            )
        }
      </p>
    )
  }
  
  render(h: CreateElement) {
    const {
      customerName = '',
      customerId = '',
      description = '',
      taskId,
      taskNo = '',
      linkMan,
      address,
      planTime = '',
      serviceContent = '',
      serviceType = '',
      isTimeout
    } = this.taskMapInfoData
    const classNames = [ComponentNameEnum.TaskMapInfoWindow, this.show ? 'no-position' : 'hidden']
    
    return (
      <div class={classNames}>
        <div class='map-info-window-content map-task-content-window'>
          <div class='map-task-content-window-header'>
            <div class='customer-name link-text' onClick={() => openTabForCustomerView(customerId)}>
              { customerName || '' }
            </div>
            {
              isTimeout && (
                <ui-task-state task={this.task}>
                </ui-task-state>
              )
            }
            <button type='button' class='task-map-info-window-close' onClick={() => this.closedHandler()}>
              <i class='iconfont icon-fe-close'></i>
            </button>
          </div>
          {
            taskNo && (
              <p>
                <label>工单编号：</label>
                <span class='link-text' onClick={() => openTabForTaskView(taskId)}>
                { taskNo }
              </span>
              </p>
            )
          }
          <p>
            <label>联系人：</label>
            <span>{ linkMan.name || '' }</span>
          </p>
          <p>
            <label>电话：</label>
            { linkMan.phone || '' }
            <biz-call-center-phone phone={linkMan.phone} />
          </p>
          { this.renderSystemField(true, '地址', fmt_address(address)) }
          <p class='map-task-content-window-header-plantime'>
            <label>计划时间：</label>
            { formatDate(planTime, DateFormatEnum.YTMHMS) || '' }
            {
              this.showModifyPlanTime && (
                <biz-modify-plan-time
                  field={this.planTimeField}
                  task={this.task}
                  onSuccess={(planTime: string) => this.planTimeChangedHandler(planTime)}
                />
              )
            }
          </p>
          { this.renderSystemField(this.isHaveServiceTypeField, '服务类型', serviceType) }
          { this.renderSystemField(this.isHaveServiceTypeField, '服务内容', serviceContent) }
          { this.renderSystemField(this.isHaveLevelField, '描述', description) }
          <div class='info-window-arrow'></div>
        </div>
      </div>
    )
  }
  
}

