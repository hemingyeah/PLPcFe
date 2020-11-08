import LoginUser from '@model/entity/LoginUser/LoginUser'

class TaskListItem {
  /**
   * 工单编号
  */
  public taskNo?: string = ''
  
  /**
   * 工单ID
  */
  public taskId?: string = ''
  
  /**
   * 优先级
  */
  public level?: string = ''
  
  /**
   * 状态
  */
  public state?: string = ''
  
  /**
   * 状态名称
  */
  public stateName?: string = ''
  
  /**
   * 工单列成对应的名称
  */
  public flowSettingName?: string = ''
  
  /**
   * 计划时间
  */
  public planTime?: number | null = null
  
  /**
   * 完成时间
  */
  public completeTime?: number | null = null
  
  /**
   * 工单类型Id，默认工单为1
  */
  public templateId?: string = ''
  
  /**
   * 工单类型名称
  */
  public templateName?: string = ''
  
  /**
   * 审批状态 1为审批中
  */
  public inApprove?: number | null = null
  
  /**
   * 暂停状态 1为暂停中
  */
  public isPaused?: number | null = null
  
  /**
   * 当前流程发生超时的时间
   */
  public overTime?: number | null = null
  
  /**
   * 位置异常标记
   */
  public positionException?: number | null = null
  
  /**
   * 工单地址
   */
  public taddress?: any = null
  
  /**
   * 负责人用户头像
   */
  public executorImage?: string = ''
  
  /**
   * 负责人名
   */
  public executorName?: string = ''
  
  /**
   * 客户名
   */
  public customerName?: string = ''
  
  /**
   *
   */
  public fieldNames?: {[x: string]: any} = {}
  
  /**
   * 示例数据
   */
  public isGuideData?: boolean = false
  
  /**
   * 工单拒绝或取消的原因
   */
  public reason?: string = ''
  
  /**
   * 工时记录 是否在计时
   */
  public isTiming?: boolean = false
  
  public distance?: number | null = null
  
  /**
   * 是否结算，0未结算，1已结算
   */
  public balanceConfirm?: number | null = null
  
  /**
   * 是否回访，默认为0（0：未回访，1：回访）
   */
  public isReview?: number | null = null
  
  public viewBalanceTab?: boolean  = false
  
  public viewReviewTab?: boolean = false
  
  public executor?: string = ''
  
  /*
   * 结算标记，默认-1，0未结算，1已结算
  */
  public isSettled?: number | null = null
  
  /*
   * 回访标记，默认-1，0未回访，1已回访
  */
  public isReviewed?: number | null = null
  
  /*
   * 创建人用户实体
   */
  public createUserEntity?: LoginUser = new LoginUser()
  
  //协同人
  public synergies?: string[] = []
  
  public isEncryptPlanTime?: boolean = false
}

export default TaskListItem