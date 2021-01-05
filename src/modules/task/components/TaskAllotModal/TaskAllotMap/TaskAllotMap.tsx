/* components */
import TaskAllotModal from '@src/modules/task/components/TaskAllotModal/TaskAllotModal.tsx'
import TaskMapInfoWindow from '@src/modules/task/components/TaskAllotModal/TaskMapInfoWindow/TaskMapInfoWindow.tsx'
/* entity */
import TaskAddress from '@model/entity/TaskAddress'
import Field from '@model/entity/Field'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
import EventNameEnum from '@model/enum/EventNameEnum'
import TaskStateEnum from '@model/enum/TaskStateEnum'
import { TaskFieldNameMappingEnum } from '@model/enum/FieldMappingEnum'
/* util */
import { findComponentUpward } from '@src/util/assist'
import Log from '@src/util/log.ts'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotMap/TaskAllotMap.scss'
/* vue */
import { Component, Prop, Ref } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import VC from '@model/VC'
/* types */
import TaskConfig from '@model/types/TaskConfig'
import TaskType from "@model/entity/TaskType";

declare let AMap: any

@Component({ 
  name: ComponentNameEnum.TaskAllotMap,
  components: {
    TaskMapInfoWindow
  }
})
export default class TaskAllotMap extends VC {
  
  /* 工单地图信息弹窗组件 */
  @Ref() readonly TaskMapInfoWindowComponent!: TaskMapInfoWindow
  
  // 地图 id
  @Prop() readonly idName: string | undefined
  // 工单类型列表
  @Prop() readonly taskTypesMap: { [x: string]: TaskType} | undefined
  // 自定义事件
  @Prop() readonly handlerCustomFunc: Function | undefined
  // 设置地图事件
  @Prop() readonly setMapFunc: Function | undefined
  
  /* 地图对象 */
  private AMap: any = null
  /* 地图弹窗对象 */
  private AMapInfoWindow: any = null
  /* 是否显示地图弹窗信息 */
  private showMapInfoWindow: boolean = false
  
  /* 是否为创建人 */
  private get isCreator(): boolean {
    return this.TaskAllotModalComponent.outsideIsCreator
  }
  
  /* 是否为负责人 */
  private get isExecutor(): boolean {
    return this.TaskAllotModalComponent.outsideIsExecutor
  }
  
  /* 计划时间字段 */
  private get planTimeField(): Field {
    return this.taskFields.filter(field => field.fieldName === TaskFieldNameMappingEnum.PlanTime)[0] || {}
  }
  
  /* 工单派单组件 */
  private get TaskAllotModalComponent(): TaskAllotModal {
    return findComponentUpward(this, ComponentNameEnum.TaskAllotModal) || {}
  }
  
  /* 工单 */
  private get task(): any {
    // 默认是获取的工单派单组件的，如需自定义 需要自己写
    return this.TaskAllotModalComponent.outsideTask || {}
  }
  
  /* 工单 */
  private get taskType(): TaskType {
    return this.taskTypesMap?.[this.task?.templateId] || { id: '', templateId: '' }
  }
  
  /* 工单配置信息 */
  private get taskConfig(): TaskConfig {
    return this.TaskAllotModalComponent.outsideTaskConfig || {}
  }
  
  /* 工单字段列表 */
  private get taskFields(): Field[] {
    return this.TaskAllotModalComponent.outsideFields
  }
  
  /**
   * @description 工单客户地址地址 
   * 工单新建后地址信息在taddress里面，新建的信息在address里面
  */
  get taskAddress(): TaskAddress {
    return new TaskAddress(this.task.taddress || this.task.address || {})
  }
  
  /** 
   * @description 工单信息中计划时间是否可以修改
   * 1. 工单状态是待指派或已拒绝
   * 3. 工单设置允许修改计划时间
  */
  get allowModifyPlanTime() {
    let states = [TaskStateEnum.CREATED.value, TaskStateEnum.REFUSED.value]
    let { state } = this.task
    return this.taskConfig.taskPlanTime && states.indexOf(state) >= 0
  }
  
  /** 
   * @description 构建客户地址标记
  */
  private buildCusomterAddressMarker(): void {
    let { validAddress } = this.taskAddress
    if (!validAddress) {
      return Log.warn('taskAddress.validAddress is false', this.buildCusomterAddressMarker.name)
    }
    
    // 添加自定义点标记
    let customerAddressMarker = new AMap.Marker({
      map: this.AMap,
      // 基点位置
      position: this.getMapCenter(),
      // 相对于基点的偏移位置
      offset: new AMap.Pixel(-17, -42),
      // 自定义点标记覆盖物内容
      content: this.buildCustomerAddressMapMarkerContent()
    })
    
    // 鼠标悬停 显示客户信息
    customerAddressMarker.on(EventNameEnum.MouseOver, (event: any) => {
      this.showMapInfoWindow = true
      this.AMapInfoWindow = new AMap.InfoWindow({
        closeWhenClickMap: true,
        isCustom: true,
        offset: new AMap.Pixel(0, -34),
        content: this.TaskMapInfoWindowComponent?.$el
      })
      
      this.AMapInfoWindow.open(this.AMap, event.target.getPosition())
    })
  }

  /**
   * @description 构建客户地址标记内容
  */
  private buildCustomerAddressMapMarkerContent(): string {
    return '<div class="customer-marker"><i class="bm-location-dot"></i><div class="map-address-title">客户地址</div></div>';
  }
  
  /**
   * @description 关闭地图标记弹窗
   */
  private closeInfoWindowHandler() {
    this.AMapInfoWindow?.close()
  }
  
  /**
   * @description 获取地图中心
  */
  private getMapCenter(): Array<number> {
    let { taskAddress } = this
    let { latitude, longitude } = taskAddress
    let center = []
    
    // 是否为有效地址
    if (taskAddress.validAddress) {
      center = [Number(longitude), Number(latitude)]
    } else {
      // 高德地图不支持国外地址解析，那就手动设置为大首都北京吧
      center = [116.397428, 39.90923]
    }
    
    return center
  }
  
  /**
   * @description 地图初始化事件
  */
  private mapInit(): void {
    if (!this.idName) {
      return Log.error('TaskAllotMap component props idName is empty', this.mapInit.name)
    }
    
    Log.succ(Log.Start, this.mapInit.name)
    
    this.AMap = new AMap.Map(this.idName, {
      resizeEnable: true,
      center: this.getMapCenter(),
      zoom: 10
    })
    
    // 构建客户地址标记
    this.buildCusomterAddressMarker()
    // 设置地图数据
    this.setMapFunc && this.setMapFunc(this.AMap)
    // 自定义操作
    this.handlerCustomFunc && this.handlerCustomFunc(this.AMap, this.AMapInfoWindow)
    // Log
    Log.succ(Log.End, this.mapInit.name)
  }
  
  /**
   * @description 地图初始化事件
   * -- 支持外部调用的
  */
  public outsideMapInit() {
    this.mapInit()
  }
  
  /**
   * @description 计划时间修改变化事件
   * -- 支持外部调用的
  */
  private planTimeChangedHandler(planTime: string) {
    Log.succ(Log.Start, `TaskAllotMap -> ${this.planTimeChangedHandler.name}`)
    this.TaskAllotModalComponent.outsideSetTask({
      ...this.task,
      planTime
    })
  }
  
  mounted() {
    this.mapInit()
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotMap}>
        <div id={this.idName}></div>
        <task-map-info-window
          onPlanTimeChange={(planTime: string) => this.planTimeChangedHandler(planTime)}
          ref='TaskMapInfoWindowComponent'
          planTimeField={this.planTimeField}
          show={this.showMapInfoWindow}
          showModifyPlanTime={this.allowModifyPlanTime}
          task={this.task}
          taskType={this.taskType}
          onClose={() => this.closeInfoWindowHandler()}
        />
      </div>
    )
  }
  
}

