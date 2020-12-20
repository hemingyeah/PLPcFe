/* components */
import BizCallCenterPhone from '@src/component/business/BizCallCenterPhone/BizCallCenterPhone.tsx'
import BizModifyPlanTime from '@src/component/business/BizModifyPlanTime/BizModifyPlanTime.tsx'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import DateFormatEnum from '@model/enum/DateFormatEnum'
/* entity */
import Field from '@model/entity/Field'
/* vue */
import VC from '@model/VC'
import { Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* util */
import { openTabForTaskView, openTabForCustomerView } from '@src/util/business/openTab'
import { fmt_address } from '@src/filter/fmt'
import { formatDate } from '@src/util/lang'
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
    this.linkMan = data?.linkMan || { name: data.tlmName, phone: data.tlmPhone }
    this.planTime = data?.planTime || ''
    this.serviceType = data?.serviceType || ''
    this.serviceContent= data?.serviceContent || ''
    this.taskId = data?.taskId || data?.id || data?.taskUUID || ''
    this.taskNo = data?.taskNo || ''
  }
}

enum TaskMapInfoWindowEmitEventNameEnum {
  PlanTimeChange = 'planTimeChange'
}

@Component({ 
  name: ComponentNameEnum.TaskMapInfoWindow,
  components: {
    BizCallCenterPhone,
    BizModifyPlanTime
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
  
  /* 工单地图信息弹窗数据 */
  get taskMapInfoData(): TaskMapInfoData {
    return new TaskMapInfoData(this.task)
  }
  
  /** 
   * @description 计划时间修改完成事件
  */
  @Emit(TaskMapInfoWindowEmitEventNameEnum.PlanTimeChange)
  private planTimeChangedHandler(planTime: string) {
    Log.succ(Log.Start, `TaskMapInfoWindow -> ${this.planTimeChangedHandler.name}`)
    return planTime
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
            { isTimeout ? <div class='map-task-content-window-header-timeout'>超时接单</div> : '' }
          </div>
          <p>
            <label>工单编号：</label>
            <span class='link-text' onClick={() => openTabForTaskView(taskId)}>
              { taskNo }
            </span>
          </p>
          <p><label>联系人：</label>{ linkMan.name || '' }</p>
          <p>
            <label>电话：</label>
            { linkMan.phone || '' }
            <biz-call-center-phone phone={linkMan.phone} />
          </p>
          <p><label>地址：</label>{ fmt_address(address) || '' }</p>
          <p>
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
          <p><label>服务类型：</label>{ serviceType || '' }</p>
          <p><label>服务内容：</label>{ serviceContent || '' }</p>
          <p><label>描述：</label>{ description || '' }</p>
          <div class='info-window-arrow'></div>
        </div>
      </div>
    )
  }
  
}

