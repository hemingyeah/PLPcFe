import BaseSearchModel from '@model/entity/BaseSearchModel'

/* 用于工单查询条件接收 */
interface TaskSearchModel extends BaseSearchModel {

  // 所属的客户id
  customerId?: string
  // 租户Id
  tenantId?: string
  // 工单状态 finish/unFinish等等
  stateType?: string
  // 工单状态列表
  stateTypeList?: []
  // 创建时间 example = yyyy-MM-dd HH?:mm?:ss
  createTimeStart?: string
  // 创建时间end  example = yyyy-MM-dd HH?:mm?:ss
  createTimeEnd?: string
  // 用户id
  userId?: string
  // 开始时间
  timeStart?: string
  // 结束时间
  timeEnd?: string
  // 计划开始时间
  planTimeStart?: string
  // 计划结束时间
  planTimeEnd?: string
  // 团队ID
  tagId?: string
  // 多团队ID
  tagIds?: string[]
  // 任务负责人
  executorId?: string
  // 协同人
  synergyId?: string
  // 创建人
  createUserId?: string
  // 工单类型id
  templateId?: string
  // 异常工单
  isException?: number
  // 工单ids
  ids?: string[]
  // 多种状态筛选
  stateList?: string[]
  // 回访数据
  isReview?: number
  // 回访列表选 1人工回访 2客户评价
  reviewType?: number
  // taskView权限，1，2，3
  dataLevel?: number
  // 用户id
  myId?: string
  // 判断是否开启回访后自动关闭工单
  autoClosed?: boolean
  // 工单状态
  state?: string


  /************************************************
   *
   * 我下面的所有字段，如果有用到的，自己复制一份到我上面，按照上面格式来
   *
   * ***************************************************/


  //任务名称
  name?: string
  //任务类型
  type?: string
  //任务优先级
  level?: string

  //任务负责人
  executor?: string
  executors?: string[]

  productType?: string
  planStart?: Date
  planEnd?: Date
  // 派单人
  allotUser?: string
  //完成时间搜索区段
  completeTimeStart?: string
  completeTimeEnd?: string
  reviewTimeStart?: string
  reviewTimeEnd?: string

  //派单时间字符串，用于列表页高级搜索
  allotTimeStr?: string
  allotTimeStart?: string
  allotTimeEnd?: string

  //接受时间字符串，用于列表页高级搜索
  acceptTimeStr?: string
  acceptTimeStart?: string
  acceptTimeEnd?: string

  //开始时间字符串，用于列表页高级搜索
  startTimeStr?: string
  startTimeStart?: string
  startTimeEnd?: string

  //结算时间字符串，用于列表页高级搜索
  balanceTimeStr?: string
  balanceTimeStart?: string
  balanceTimeEnd?: string

  reviewUser?: string
  degree?: string
  // 是否展开搜索框 0?:关闭
  isAdvanced?: number
  linkmanId?: string
  serviceOrderId?: number
  // 状态 1 进行中 2 已完成
  serverState?: number
  customerProductId?: string
  // my-我的 icreate-我创建的 team-团队的  synergy-协同的
  whoseInfo?: string
  teamId?: number
  // 创建人
  createUser?: string
  // 判断是否需要添加权限验证
  isPermission?: string
  // 搜索关键字
  keyword?: string
  searchBy?: string
  // 团队的
  departmentId?: string
  // 服务类型
  serviceType?: string
  // 服务内容
  serviceContent?: string
  // 产品id
  productId?: string

  /**
   * 我的搜索
   * create?:我创建的
   * execute?:我负责的
   * synergy?:我协同的
   * all?:所有
   * none?:根据高级搜索信息搜索，无视以上几种
   */
  mySearch?: string
  customerLinkman?: string
  inTaskPool?: number

  //超时工单
  isOverTime?: number
  //客户地址搜索
  cusProvince?: string
  cusCity?: string
  cusDist?: string
  cusAddress?: string

  //选了客户评价后 1已评价 0未评价 2全部
  isEvaluate?: number
  onceOverTime?: number
  onceRefused?: number
  oncePaused?: number
  allotType?: number

  updateTimeStart?: string
  updateTimeEnd?: string
  inApprove?: number

  //曾超时暂停拒绝整合 1超时 2拒绝 3暂停 4位置异常
  onceException?: number
  //曾转派
  onceReallot?: number
  //曾打印
  oncePrinted?: number
  //曾回退
  onceRollback?: number

  //异常类型 0全部 1暂停 2超时
  exceptionType?: number

  //用于传参 暂不用于搜索
  customerName?: string
  linkmanName?: string
  tagName?: string
  createUserName?: string
  allotUserName?: string
  executorName?: string
  synergyName?: string
  reviewUserName?: string
  productName?: string

  //地址是否有效
  validAddress?: boolean

  //API 项目用于查询的字段
  taskNo?: string

  /**
   * 工单类型IdList
  */
  taskTypeIdList?: string[]
  //预约时间搜索区段
  planTimeStr?: string
  //回访时间
  reviewTimeStr?: string
  //关闭时间字符串，用于列表页高级搜索
  closeTimeStr?: string
  closeTimeStart?: string
  closeTimeEnd?: string
  balanceUserName?: string
  balanceUser?: string

}

export default TaskSearchModel