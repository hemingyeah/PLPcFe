import TaskPoolEncryptionConfig from '@model/types/encryption/TaskPoolEncryptionConfig'
import TaskCustomerConfig from '@model/types//TaskCustomerConfig'
import TaskPlantimeConfig from '@model/types//TaskPlantimeConfig'
import TaskAttachmentConfig from '@model/types//TaskAttachmentConfig'
import TaskDescriptionConfig from '@model/types//TaskDescriptionConfig'
import TaskClassificationConfig from '@model/types//TaskClassificationConfig'
import TaskBalanceConfig from '@model/types//TaskBalanceConfig'
import TaskStateEnum from '@model/enum/TaskStateEnum'

class TaskConfig {  
  /**
   * 工单池加密配置
  */
  public taskPoolEncryptionConfig: TaskPoolEncryptionConfig = new TaskPoolEncryptionConfig()
  /**
   * 工单客户配置
  */
  public taskCustomerConfig: TaskCustomerConfig = new TaskCustomerConfig()
  /**
   * 工单预约时间配置
  */
  public taskPlantimeConfig: TaskPlantimeConfig = new TaskPlantimeConfig()
  /**
   * 工单附件配置
  */
  public taskAttachmentConfig: TaskAttachmentConfig = new TaskAttachmentConfig()
  /**
   * 工单描述
  */
  public taskDescriptionConfig: TaskDescriptionConfig = new TaskDescriptionConfig()
  /**
   * 工单分类信息
  */
  public taskClassificationConfig: TaskClassificationConfig = new TaskClassificationConfig()
  
  /**
   * 工单结算
   */
  public taskBalanceConfig: TaskBalanceConfig = new TaskBalanceConfig()
  /*
   * 设置哪些工单不允许编辑
  */
  public taskUpdateConfig: string[] = [TaskStateEnum.OFFED.value, TaskStateEnum.CLOSED.value]
  
  
  public level: string[] = ['一般', '紧急', '非常紧急']
  public type: string[] =  ['安装', '维修', '培训']
  
  /**
   * 创建
   */
  public taskCreate: boolean = true
  /**
   * 指派
   */
  public taskAllot: boolean = true
  /**
   * 开始
   */
  public taskStart: boolean = true
  /**
   * 接受
   */
  public taskAccept: boolean = true
  /**
   * 完成
   */
  public taskFinish: boolean = true
  /*
   * 拒绝
  */
  public taskRefuse: boolean = true
  /**
   * 结算
   */
  public taskCost: boolean = true
  /**
   * 关闭
   */
  public taskClose: boolean = true
  /**
   * 取消
   */
  public taskOff: boolean = true
  /**
   * 回访
   */
  public taskReview: boolean = false
  
  /**
   * 转派
   */
  public taskReallot: boolean = true
  
  /**
   * 预约时间
   */
  public taskPlanTime: boolean = true
  /**
   * 协同人
   */
  public taskSynergy: boolean = true
  
  /**
   * 回退
   * @return
  */
  public taskRollBack: boolean = true
  /**
   * 地图派单
   */
  public taskAllotByMap: boolean = true
  /**
   * 开启工单池
   */
  public taskPoolOn: boolean = true
  /**
   * 开启团队派单
   */
  public allotByTag: boolean = false
  /**
   * 开启专属服务团队派单模式
   */
  public allotByExclusiveTag: boolean = false
  /**
   * 允许批量结算
   */
  public canBalanceBatch: boolean = false
  /**
   * 允许批量关闭
   */
  public canCloseBatch: boolean = false
  /**
   * 自动回访
   */
  public autoReview: boolean = true
  /**
   * 相应通知附加工单进度
   */
  public responseWithUrl: boolean = true
  /**
   * 自动分配规则开关
   */
  public autoDispatch: boolean = false
  
  /**
   * 工单池最大抢单范围，默认为空，单位___公里，范围内的用户会收到抢单通知
   * 设置的时候按公里设置，存值的时候按米存
  */
  public poolMaxRange: number = 0
  
  /**
   * 工单池最大抢单人数，默认为空，————人，当通知范围内的用户数（按距离更近优先推送）
   */
  public poolMaxUsers: number = 0
  
  /**
   * 工单池超时时间,默认为空,工单池超时后会将工单设置为超时
   */
  public poolOverTime: number = 0.00
  
  /**
   * 工单池超时通知开关，开关打开，1时工单超时会通知工单派单人
   */
  public isNotice: boolean = false
  /**
   * 工单池超时自动分配开关，开关打开，1时工单超时会根据分配规则自动派单，该开关的状态与启用自动分配规则的开关状态保持一致
   * 即与autoDispatch保持一致
   */
  public allowAutoDispatch: boolean = false
  
  /**
   * 工单池超时时间,默认为空,工单池超时后将会通知工单派单人
   */
  public planTimeNotice: number = 0.00
  
  /**
   * 工单池按照服务团队区分权限 默认为禁用
   * 启用后，用户只能收到客户属于自己服务团队的工单通知和查看自己所属服务团队客户的工单
  */
  public poolByTag: boolean = false
  
  /**
   * 已经派单的工单是否允许转派到工单池 默认为禁用
  */
  public reallotToPool: boolean = false
  
  /**
   * 允许工单负责人修改工单，即使没有编辑工单权限
  */
  public allowExec2Edit: boolean = false
  
  /**
   * 最大工单类型数量 默认是5
  */
  public maxTaskTypeNum: number = 5
  
  /**
   * 审批是否必填，默认是
  */
  public approveRemark: boolean = true
  
  /**
   * 转派后工单状态是否保留 默认false
  */
  public reallotStateRetain: boolean = false
  
  /**
   * 派单时“隐藏人员位置信息”功能，默认关闭
  */
  public invisibleLocation: boolean = false
  
  /**
   * 允许在移动端个人中心显示工单统计信息
  */
  public mobileShowTaskInfo: boolean = true
  /**
   * 允许在移动端个人中心显示工单营收信息
  */
  public mobileShowRevenueInfo: boolean = true
  
  //转派说明必填，默认必填
  public reallotRemarkNotNull: boolean = true
  
  /**
   * 单日最大接单次数
   */
  public singleDayMaxOrderNum: number = 50
  
  /**
   * 允许在移动端填备注时自动获取地理位置
  */
  public mobileRemarkLocation: boolean = false
  
  /*
   *  开启移动端工单列表操作按钮功能
  */
  public appOperateButton: boolean = false
  
  /**
   * 需要审批的是否自动分配
  */
  public needApprove: boolean = false
}

export default TaskConfig