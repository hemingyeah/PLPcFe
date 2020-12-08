import PageInput from '@model/types/PageInput'
import Condition from '@model/types/Condition'
import EsSort from '@model/types/EsSort'

import TaskListViewEnum from '@model/enum/TaskViewEnum'
import TaskFlagEnum from '@model/enum/TaskFlagEnum'
import TaskSearchConditionEnum from '@model/enum/TaskSearchConditionEnum'

/* 工单搜索对象 */
class EsTaskSearchInput extends PageInput {
  // 租户Id
  public tenantId?: string = ''
  // 工单类型Id
  public templateId?: string = ''
  // 异常标记：曾超时暂停拒绝整合 1超时 2拒绝 3暂停 4回退 5位置异常
  public onceException?: number | null = null
  // 曾超时
  public onceOverTime?: number | null = null
  // 曾拒绝
  public onceRefused?: number | null = null
  // 曾暂停
  public oncePaused?: number | null = null
  // 曾转派
  public onceReallot?: number | null | undefined = null
  // 曾打印
  public oncePrinted?: number | null = null
  // 派单方式
  public allotType?: number | null = null
  // 是否审批中
  public inApprove?: number | null = null
  // 是否异常
  public isException?: number | null = null
  // 关键字搜索
  public keyword?: string = ''
  /** 
   * @see TaskSearchConditionEnum
  */
  // 关键词搜索类型
  public searchCondition?: string = TaskSearchConditionEnum.工单编号
  // 协同人userId
  public synergyId?: string = ''
  // 创建人userId
  public createUser?: string = ''
  // 负责人userId
  public executor?: string = ''
  // 派单人userId
  public allotUser?: string = ''
  // 结算userId
  public balanceUser?: string = ''
  // 工单按团队搜索
  public tagId?: string = ''
  // 服务团队负责人userIdList，配合tagId一起使用
  public oneTagExecutorIdList?: string[] = []
  // 多个团队
  public tagIds?: string[] = []
  // 团队负责人userIdList，配合tagIds一起使用
  public tagExecutorIdList?: string[] = []
  // 我所有客户
  public customerUserIdList?: string[] = []
  // 我客户的：工单的客户的创建人和负责人id
  public customerUserId?: string = ''
  // 开始时间
  public timeStart?: string = ''
  // 结束时间
  public timeEnd?: string = ''
  // value = "创建时间start", example = "2018-01-02"
  public createTimeStart?: Date | string | null = null
  // value = "创建时间end", example = "2018-01-02"
  public createTimeEnd?: Date | string | null = null
  // 计划时间start
  public planTimeStart?: Date | string | null = null
  // 计划时间end
  public planTimeEnd?: Date | string | null = null
  // 派单时间start
  public allotTimeStart?: Date | string | null = null
  // 派单时间end
  public allotTimeEnd?: Date | string | null = null
  // 完成时间start
  public completeTimeStart?: Date | string | null = null
  // 完成时间end
  public completeTimeEnd?: Date | string | null = null
  // 回访时间start
  public reviewTimeStart?: Date | string | null = null
  // 回访时间end
  public reviewTimeEnd?: Date | string | null = null
  // 结算时间start
  public balanceTimeStart?: Date | string | null = null
  // 结算时间end
  public balanceTimeEnd?: Date | string | null = null
  // 关闭时间start
  public closeTimeStart?: Date | string | null = null
  // 关闭时间end
  public closeTimeEnd?: Date | string | null = null
  // 接受时间start
  public acceptTimeStart?: Date | string | null = null
  // 接受时间end
  public acceptTimeEnd?: Date | string | null = null
  // 开始时间start
  public startTimeStart?: Date | string | null = null
  // 开始时间end
  public startTimeEnd?: Date | string | null = null
  // 更新时间start
  public updateTimeStart?: Date | string | null = null
  // 更新时间end
  public updateTimeEnd?: Date | string | null = null
  // 确认时间start
  public confirmTimeStart?: Date | string | null = null
  //  确认时间end
  public confirmTimeEnd?: Date | string | null = null
  // 优先级
  public level?: string = ''
  // 超时时间
  public overTime?: Date | null = null
  // 服务类型
  public serviceType?: string = ''
  // 服务内容
  public serviceContent?: string = ''
  // 工单状状态
  public state?: string = ''
  // 工单状态list
  public stateList?: string[] = []
  // 工单池标记
  public inTaskPool?: number | null = null
  // 客户id
  public customerId?: string = ''
  // 产品id
  public productId?: string = ''
  // 工单idList
  public ids?: string[] = []
  //这个参数在工单视图以前的SearchModel中默认是0,现在改为null
  // 已回访
  public isReview?: number | null = null
  // 客户联系人
  public customerLinkman?: string = ''
  // 省搜索
  public cusProvince?: string = ''
  // 市搜索
  public cusCity?: string = ''
  // 区搜索
  public cusDist?: string = ''
  // 详细地址搜索
  public cusAddress?: string = ''
  // 异常类型 0全部 1暂停 2超时
  public exceptionType?: number | null = null
  
  // 数据权限
  public dataLevel?: number | null = null
  // 搜索人id，配合数据权限使用
  public myId?: string = ''
  // 负责人userIdList，配合数据权限使用
  public executorIdList?: string[] = []
  // 客户IdList，配合数据权限使用
  public customerIdList?: string[] = []
  
  // 自定义字段的搜索条件
  public conditions?: Condition[] = []
  // 排序，默认按照创建时间倒序
  public sorts?: EsSort[] = []
  
  // 团队ID，用于查询符合团队的客户
  public cusTagIds?: string[] = []
  
  // 工单类型IdList，用来工单池顶部统计查询时筛选工单类型
  public taskTypeIdList?: string[] = []
  
  // 是否回退过 1回退过 2未回退过
  public onceRollback?: number | null = null
  
  // 地址是否有效
  public validAddress?: boolean | null = null
  
  // 起始距离
  public startDistance?: number | null = null
  // 终止距离
  public endDistance?: number | null = null
  // 当前位置经度
  public myLongitude?: number | null = null
  // 当前位置纬度
  public myLatitude?: number | null = null
  /** 
   * @see TaskListViewEnum
  */
  // 视图
  public view?: string = TaskListViewEnum.全部工单
  // 已经筛选过的工单ID
  public taskIds?: string[] = []
  // 已结算
  public isSettled?: number | null = null
  
  //回访列表选 1人工回访 2客户评价
  // 回访列表选 1人工回访 2客户评价
  public reviewType?: number | null = null
  
  // 满意度?: 不满意, 满意, 一般
  public degree?: string = ''
  /**
   * 工单池有部分订单没有坐标，所以根据地理位置范围筛选时会过滤掉。
   * 如果需要获取没有坐标的工单，noGeo = true。
  */
  // 获取是否有定位的工单
  public noGeo?: boolean = false
  /**
   * 是否按距离排序
  */
  public orderByDistance?: boolean = false
  
  /**
   * 忽略工单池权限
  */
  public ignoreTaskPoolAuth?: boolean = false
  /**
   * 是否是移动端的工单状态，search方法特殊处理
  */
  public mobileState?: boolean = false
  
  public balanceConfirm?: number | null = null
  
  // 工单编号
  public taskNo?: string = ''
  
  //自定义结算字段
  public balanceConditions?: Condition[] = []
  // 是否结算
  public isEvaluate?: number | null = null
  // 回访人id
  public reviewUser?: string = ''
  
  /**
  * 多选
  */
  // 工单类型ids
  public templateIds?: string[] = []
  // 服务类型
  public serviceTypes?: string[] = []
  // 服务内容
  public serviceContents?: string[] = []
  // 优先级
  public levels?: string[] = []
  // 团队ids
  public searchTagIds?: string[] = []
  // 创建人ids
  public  createUserIds?: string[] = []
  // 派单人userId
  public allotUserIds?: string[] = []
  // 负责人userIds
  public executorUserIds?: string[] = []
  // 协同人userIds
  public synergyUserIds?: string[] = []
  // 工单状态
  public searchStateList?: string[] = []
  // 派单方式
  public allotTypes?: number[] = []
  // 支付方式
  public payTypes?: string[] = []
  
  /**
   * @see TaskFlagEnum
  */
  // 工单标记(如?: 曾退回、曾超时)
  public flags?: string[] = []
  
  // 系统字段高级搜索
  public systemConditions?: Condition[] = []
  
  // 结算列表查询移动端专用参数
  public appSearchKey?: string = ''
}

export default EsTaskSearchInput