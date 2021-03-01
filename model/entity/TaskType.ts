import Field from '@model/entity/Field'
import FlowSetting from '@model/types/FlowSetting'

interface TaskType {
  /* 工单类型 颜色  sample: rgb(115,127,124)  */
  defaultColors?: string[]
  id: string
  name?: string
  // 配置完之前是禁用状态 配置完后点下发布则启用 初始化默认类型时set为1
  enabled?: number 
  // 流程设置
  flowSetting?: {
    create: FlowSetting,
    allot: FlowSetting,
    accept: FlowSetting,
    start: FlowSetting,
    finish: FlowSetting,
    cost: FlowSetting,
    review: FlowSetting,
    autoReview: FlowSetting,
    close: FlowSetting,
    off: FlowSetting,
  }
  createTime?: string
  isDelete?: number
  //卡片设置
  cardSetting?: object
  //超时设置
  // 2018-10-15 新增remindType用于标识通知人群范围，null-指定人员 0-无需 1-负责人主管
  overTimeSetting?: object
  // 允许负责人暂停
  allowPause?: number
  //暂停审批人
  pauseApprovers?: object[];
  // 存放原配置信息
  options?: object
  // 服务报告配置
  reportSetting?: object
  // 打印配置
  printSetting?: object
  // 计划时间提醒设置
  planRemindSetting?: object
  // 延迟回访
  delayBack?: string
  // 延迟时间
  delayBackMin?: string
  // 允许暂停是否是领导的的标识,3（默认值）不是领导暂停，1是团队主管,2是无需权限,4是创建人,5是派单人
  isLeader?: string
  // 允许额外通知领导的的标识,0（默认值）不通知，1通知，2通知自定义人
  noticeLeader?: string
  // 通知自定义人的存储字段
  noticeUsers?: object[]
  // 可用团队，限制新建时可见的工单类型
  tags?: string[]
  // 标签（只用于行业模板库中的记录）
  labels?: string[]
  // 行业（只用于行业模板库中的记录）
  professions?: string[]
  // 描述（只用于行业模板库中的记录）
  description?: string
  // 优先级
  orderId?: number
  
  // 行业（用户向导示例数据使用）
  guideProfessions?: string[]
  // 是否为示例数据
  isGuideData?: boolean
  
  /**
   * 新的配置信息放在这，就跟configHelper一样，以后别加一个设置就加个字段了
  */
  config?: any
  
  // 字段列表 移动端查询所有工单类型会返回
  field?: Field[]
  templateId: string

}

export default TaskType