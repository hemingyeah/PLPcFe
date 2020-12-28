/* api */
import * as TaskApi from '@src/api/TaskApi'
/* enum */
import DateFormatEnum from '@model/enum/DateFormatEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import UserCardInfo from '@model/entity/UserCardInfo'
import TaskAddress from '@model/entity/TaskAddress'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* model */
import { PickerOptions } from '@src/modules/task/components/TaskAllotModal/UserCard/UserCardModel'
import { getTaskUserCardInfoResult } from '@model/param/out/Task'
/* vue */
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { CreateElement, VNode } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserCard/UserCard.scss'
/* types */
import StateColorMap from '@model/types/StateColor'
/* util */
import { dispatch } from '@src/util/emitter'
import DateUtil from '@src/util/date'
import Platform from '@src/util/Platform'
import { openTabForUserView } from '@src/util/business/openTab'
import { fmt_display_text, fmt_number_to_fixed } from '@src/filter/fmt'
import { isArray, isNull } from '@src/util/type'
import { stringArrayIntersection } from '@src/util/array'
import { parseObject } from '@src/util/parse'
import Log from '@src/util/log.ts'
import { getDistance } from '@src/util/distance'
import Customer from "@model/entity/Customer";


enum UserCardEmitEventEnum {
  // 关闭事件
  Close = 'close',
  // 设置负责人事件
  SetExecutor = 'setExecutor',
  // 设置协同人事件
  SetSynergy = 'setSynergy',
  // 删除协同人事件
  DeleteSynergyUser = 'deleteSynergyUser'
}

enum UserCardRadioEnum {
  Executor = 'executor',
  Synergy = 'synergy'
}

@Component({ name: ComponentNameEnum.UserCard })
export default class UserCard extends Vue {
  /* 客户信息 */
  @Prop() readonly customer: Customer | undefined
  // 客户团队名称列表
  @Prop() readonly customerTagNames: string[] | undefined
  // 向外发布事件的 组件名字
  @Prop() readonly emitEventComponentName: string | undefined
  // 工作状态颜色数组
  @Prop() readonly stateColorMap: StateColorMap | undefined
  // 是否显示 负责人人按钮
  @Prop({ default: true }) readonly showExecutorButton: boolean | undefined
  // 是否显示 协同人按钮
  @Prop() readonly showSynergyButton: boolean | undefined
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  // 用户id
  @Prop() readonly userId: string | undefined
  
  // 用户是否在客户团队内
  private isUserInCustomerTag: boolean = false
  // 设为负责人是否选中
  private isExecutorChecked: boolean = false
  // 设为协同人是否选中
  private isSynergyChecked: boolean = false
  // 等待状态
  private pending: boolean = false
  // 时间
  private timeRange: Date[] = []
  // 用户卡片信息
  private userCardInfo: UserCardInfo = new UserCardInfo()
  
  /* 用户信息 */
  get user(): LoginUser {
    return this.userCardInfo.user
  }
  
  @Watch('userId')
  onUserIdChanged() {
    this.computedStartAndEndTime()
    this.fetchUserTaskData()
  }
  
  /**
   * @description 设置负责人
  */
  @Emit(UserCardEmitEventEnum.SetExecutor)
  private setExecutorUser(user: LoginUser | null = this.user): LoginUser | null {
    this.dispatchEvent<LoginUser>(UserCardEmitEventEnum.SetExecutor, user)
    return user
  }
  
  /**
    * @description 设置协同人
  */
  @Emit(UserCardEmitEventEnum.SetSynergy)
  private setSynergyUser(user: LoginUser = this.user): LoginUser {
    this.dispatchEvent<LoginUser>(UserCardEmitEventEnum.SetSynergy, user)
    return user
  }
  
  /**
   * @description 清除协同人
   */
  @Emit(UserCardEmitEventEnum.SetSynergy)
  private deleteSynergyUser(user: LoginUser = this.user): LoginUser {
    this.dispatchEvent<LoginUser>(UserCardEmitEventEnum.DeleteSynergyUser, user)
    return user
  }
  
  /**
    * @description 关闭
  */
  @Emit(UserCardEmitEventEnum.Close)
  private close() {
    this.dispatchEvent<boolean>(UserCardEmitEventEnum.Close, false)
    return false
  }
  
  /* 当前选中的用户是客户的客户负责人，则显示专属标签（鼠标移动标签上提示“客户负责人”） */
  get isCustomerManager(): boolean {
    return Boolean(
      this.user
      && this.customer
      && this.user.userId === this.customer.customerManager
    )
  }
  
  /**
   * @description 工单客户地址地址
   * 工单新建后地址信息在taddress里面，新建的信息在address里面
   */
  get taskAddress(): TaskAddress {
    return new TaskAddress(this.task.taddress || this.task.address || {})
  }
  
  /**
   * @description 获取用户据客户距离
   */
  get userToCustomerDistance(): number | null {
    // 工单客户地址
    let taskCustomerAddress = this.taskAddress
    // 工单客户地址纬度
    let taskCustomerLatitude: number | null | undefined = taskCustomerAddress?.latitude
    // 工单客户地址经度
    let taskCustomerLongitude: number | null | undefined = taskCustomerAddress?.longitude
    // 用户地址纬度
    let userLatitude: number | null | undefined = this.userCardInfo?.user?.latitude
    // 用户地址经度
    let userLongitude: number | null | undefined = this.userCardInfo?.user?.longitude
    
    return getDistance(
      Number(taskCustomerLatitude), Number(taskCustomerLongitude), Number(userLatitude), Number(userLongitude)
    )
  }
  
  /**
   * @description 清除选中协同人
   */
  public clearSynergyChecked(user: LoginUser) {
    let isClear: boolean = user.userId === this.user.userId
    if (isClear) {
      this.isSynergyChecked = false
    }
  }
  
  /** 
   * @description 计算开始和结束时间
  */  
  private computedStartAndEndTime() {
    const day = 3600 * 1000 * 24
    const start = new Date()
    const end = new Date()
    
    end.setTime(end.getTime() - day)
    start.setTime(end.getTime() - day * 30)
    
    this.timeRange = [start, end]
  }
  
  /** 
   * @description 发送事件
  */
  private dispatchEvent<T>(eventName: UserCardEmitEventEnum, data: T | null): void {
    if (!this.emitEventComponentName) return
    
    Log.succ(Log.Start, this.dispatchEvent.name)
    
    // 支持由自定义组件 发出事件
    dispatch.call(
      this,
      this.emitEventComponentName, 
      eventName, 
      data
    )
  }
  
  /** 
   * @description 获取属性列表
  */
  public getAttributes() {
    return {
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
  }
  
  /** 
   * @description 获取人员工单信息
  */
  private fetchUserTaskData() {
    if (!this.userId) {
      return Log.warn('this.userId is empty', this.fetchUserTaskData.name)
    }
    
    let params = {
      executorId: this.userId || '',
      startTime: DateUtil.format(this.timeRange[0], DateFormatEnum.YTD),
      endTime: DateUtil.format(this.timeRange[1], DateFormatEnum.YTD),
      taskId: this.task?.id
    }
    
    this.pending = true
    
    TaskApi.getTaskUserCardInfo(params)
      .then((data: getTaskUserCardInfoResult) => {
        let isSuccess = data.success
        if (!isSuccess) {
          this.pending = false
          Platform.alert(data.message)
        }
        
        this.userCardInfo = parseObject(data.result)
        this.matchUserInCustomerTags()
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  private getUserInfoData(value: string | null, suffix: string): string | number {
    let newValue: string | number | null = null
    if (value !== null) {
      newValue = fmt_number_to_fixed(Number(value), 2)
    }
    
    return fmt_display_text(newValue, suffix)
  }
  
  private getUserInfoUsedTime(value: string | null): string | number {
    return this.getUserInfoData(value, '小时')
  }
  
  private getUserInfoTaskRate(value: string | null): string | number {
    if (value !== null) { value = value.substr(0, value.length - 1) }
    return this.getUserInfoData(value, '%')
  }
  
  /** 
   * @description 选择时间变化
  */
  private handlerTimeChange(value: Date[]): void {
    this.timeRange = value
    this.fetchUserTaskData()
  }
  
  /** 
   * @description 匹配用户是否在客户团队里
  */
  private matchUserInCustomerTags() {
    if (!isArray(this.customerTagNames)) return
    // 交集团队列表
    let intersectionTags: string[] = stringArrayIntersection(this.customerTagNames || [], this.userCardInfo.department)
    // 是否在客户团队内
    this.isUserInCustomerTag = intersectionTags.length > 0
  }
  
  /**
   * @description 设为负责人复选框变化
  */
  private onExecutorCheckedChanged(value: boolean) {
    this.isExecutorChecked = value
    // 设置负责人信息
    this.setExecutorUser(this.isExecutorChecked ? this.user : null)
  }
  
  /**
   * @description 设为协同人复选框变化
  */
  private onSynergyCheckedChanged(value: boolean) {
    this.isSynergyChecked = value
    // 设置/清除 负责人信息
    this.isSynergyChecked ? this.setSynergyUser() : this.deleteSynergyUser()
  }
  
  /** 
   * @description 打开用户详情tab
  */
  private openUserViewTab(): void {
    openTabForUserView(this.userId, { from: 'task' })
  }
  
  /** 
   * @description 渲染用户标签
   * -- 支持外部调用的
  */
  public outsideRenderUserLabel(label: string, className?: string) {
    return this.renderUserCardLabel(label, className)
  }
  
  /** 
   * @description 渲染用户卡片标签列表
  */
  private renderUserCardLabels(): VNode | null {
    // 判断是否有无标签
    if (!this.userCardInfo.isManager && !this.userCardInfo.isDistance && !this.userCardInfo.isPrecent) return null
    
    return (
      <div class='user-card-header-content-labels'>
        { this.userCardInfo.isManager && this.renderUserCardLabel('主管', 'manager') }
        { this.userCardInfo.isDistance && this.renderUserCardLabel('近') }
        { this.userCardInfo.isPrecent && this.renderUserCardLabel('好评') }
      </div>
    )
  }
  
  /** 
   * @description 渲染用户卡片标签
  */
  private renderUserCardLabel(label: string, className: string = ''): VNode {
    const baseClassName = 'user-label'
    const classNames = [baseClassName, `${baseClassName}-${className}`]
    
    return (
      <div class={classNames}>{label}</div>
    )
  }
  
  /** 
   * @description 渲染用户卡片团队列表
  */
  private renderUserCardTeams() {
    const departmentText = this.userCardInfo.department.join(', ') 
    
    return (
      <div class='user-card-header-content-team'>
        {
          this.isUserInCustomerTag && (
            <div>
              <el-tooltip content='客户的服务团队' placement='top'>
                <i class='iconfont icon-favorfill'></i>
              </el-tooltip>
            </div>
          )
        }
        { 
          <el-tooltip content={departmentText} placement='top'>
            <span>{departmentText}</span>
          </el-tooltip>
        }
      </div>
    )
  }
  
  /** 
   * @description 渲染用户卡片位置
  */
  private renderUserCardLocation(): VNode | null {
    // 用户或客户没有距离不显示
    if (isNull(this.userToCustomerDistance)) return null
    // 用户自定义数据属性
    let userAttribute = this.userCardInfo?.user?.attribute || {}
    // 最后登录时间
    let lastLoginTime = DateUtil.getTimeDiffStr(userAttribute?.lastLocateTime)
    
    return (
      <div class='user-card-header-content-location'>
        <i class='iconfont icon-fdn-location'></i>
        { `${this.userToCustomerDistance && this.userToCustomerDistance.toFixed(2)}KM ` }
        { lastLoginTime && `(${lastLoginTime}前)` }
      </div>
    )
  }
  
  /** 
   * @description 渲染用户卡片时间
  */
  private renderUserCardTime(): VNode {
    return (
      <div class='user-card-time'>
        <el-date-picker
          type='daterange'
          unlink-panels
          start-placeholder='开始日期'
          end-placeholder='结束日期'
          clearable={false}
          picker-options={PickerOptions}
          value={this.timeRange}
          onInput={this.handlerTimeChange}
        />
      </div>
    )
  }
  
  /** 
   * @description 渲染用户信息详情
  */
  private renderUserCardDetail(): VNode {
    // 平均响应用时
    let rangeAccept = this.getUserInfoUsedTime(this.userCardInfo.rangeAccept)
    // 平均工作用时
    let rangeWork = this.getUserInfoUsedTime(this.userCardInfo.rangeWork)
    // 平均响应用时dom
    let rangeAcceptDom = (
      <el-tooltip content={rangeAccept} placement='top'>
        <span>{rangeAccept}</span>
      </el-tooltip>
    )
    // 平均工作用时dom
    let rangeWorkDom = (
      <el-tooltip content={rangeWork} placement='top'>
        <span>{rangeWork}</span>
      </el-tooltip>
    )
    
    return (
      <div class='user-card-detail'>
        <div class='user-card-detail-row'>
          {this.renderUserCardDetailChunk('未完成工单量', fmt_display_text(this.userCardInfo.unfinished, '个'))}
          {this.renderUserCardDetailChunk('已完成工单量', fmt_display_text(this.userCardInfo.finished, '个'))}
          {this.renderUserCardDetailChunk('平均工作用时', rangeWorkDom)}
        </div>
        <div class='user-card-detail-row'>
          {this.renderUserCardDetailChunk('拒单率', this.getUserInfoTaskRate(this.userCardInfo.refuse))}
          {this.renderUserCardDetailChunk('转派率', this.getUserInfoTaskRate(this.userCardInfo.allot))}
          {this.renderUserCardDetailChunk('好评率', this.getUserInfoTaskRate(this.userCardInfo.degree))}
        </div>
      </div>
    )
  }
  
  /** 
   * @description 渲染用户信息详情
  */
  private renderUserCardDetailChunk(label: string, value: string | number | null | VNode): VNode {
    return (
      <div class='user-card-detail-chunk'>
        <div class='user-card-detail-chunk-content'>{value}</div>
        <div class='user-card-detail-chunk-label'>{label}</div>
      </div>
    )
  }
  
  mounted() {
    this.computedStartAndEndTime()
    this.fetchUserTaskData()
  }
  
  render(h: CreateElement) {
    const attrs = this.getAttributes()
    
    return (
      <div class='user-card' {...attrs}>
          <div class='user-card-close' onClick={() => this.close()}>
            <i class='iconfont icon-fe-close'></i>
          </div>
          <div class='user-card-header'>
            <div class='user-card-header-head'>
              <img src={this.user?.head || DefaultHead} />
            </div>
            <div class='user-card-header-content'>
              
              <div class='user-card-header-content-top'>
                <div class='user-card-header-content-name' onClick={() => this.openUserViewTab()}>
                  {this?.user?.displayName}
                  { this.isCustomerManager && (
                    <el-tooltip content='客户负责人' placement='top'>
                      <i class='iconfont icon-huangguan'></i>
                    </el-tooltip>
                  )}
                </div>
                <div class='user-card-header-content-state'>
                  <span class='user-state-round' style={{
                    backgroundColor: this.stateColorMap && this.stateColorMap[this.user?.state || '']
                  }}>
                  </span>
                  <span>{this.user?.state}</span>
                  <span>{this.user?.cellPhone}</span>
                </div>
                { this.renderUserCardLabels() }  
              </div>
              
              {this.renderUserCardTeams()}
              {this.renderUserCardLocation()}
              
            </div>
          </div>
          {this.renderUserCardTime()}
          {this.renderUserCardDetail()}
          
          <div class='user-card-footer'>
            {
              this.showExecutorButton && (
                <el-checkbox value={this.isExecutorChecked} onInput={(value: boolean) => this.onExecutorCheckedChanged(value)}>
                  设为负责人
                </el-checkbox>
              )
            }
            {
              this.showSynergyButton && (
                <el-checkbox value={this.isSynergyChecked} onInput={(value: boolean) => this.onSynergyCheckedChanged(value)}>
                  设为协同人
                </el-checkbox>
              )
            }
          </div>
      </div>
    )
  }

}


