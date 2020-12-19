/* 工单指派 通用表格列 */
const TaskAllotUserTableCommonColumns = [
  {
    "label": "设为负责人",
    "field": "excutor",
    "show": true,
    "fixed": false,
    "width": "100px",
    "type": "column"
  },
  {
    "label": "员工",
    "field": "displayName",
    "show": true,
    "fixed": false,
    "width": "150px",
    "type": "column",
    "disabled": true
  },
  {
    "label": "所在团队",
    "field": "tags",
    "show": true,
    "fixed": false,
    "width": "150px",
    "type": "column",
  },
  {
    "label": "员工角色",
    "field": "roles",
    "show": true,
    "fixed": false,
    "width": "150px",
    "type": "column"
  },
  {
    "label": "未完成工单",
    "field": "ufinish",
    "show": true,
    "fixed": false,
    "sortable": 'custom',
    "width": "150px",
    "type": "column"
  },
  {
    "label": "今日已完成",
    "field": "finish",
    "show": true,
    "fixed": false,
    "sortable": 'custom',
    "width": "150px",
    "type": "column"
  },
  {
    "label": "计划时间当天工单量",
    "field": "plan",
    "show": true,
    "fixed": false,
    "sortable": 'custom',
    "width": "180px",
    "type": "column"
  },
  {
    "label": "好评率",
    "field": "degree",
    "show": true,
    "fixed": false,
    "sortable": 'custom',
    "width": "150px",
    "type": "column"
  }
]

/* 工单指派 工作状态列 */
const TaskAllotUserTableStateColumn = {
  "label": "工作状态",
  "field": "state",
  "show": true,
  "fixed": false,
  "sortable": false,
  "width": "150px",
  "type": "column"
}

/* 工单指派 直线列 */
const TaskAllotUserTableLineLocationColumn = {
  "label": "距离(km)",
  "field": "lineDistance",
  "show": true,
  "fixed": false,
  "sortable": 'custom',
  "width": "150px",
  "type": "column"
}

/* 工单指派 企业版支持列 */
export const TaskAllotUserTableEnterpriseEditionColumns = [
  ...TaskAllotUserTableCommonColumns,
  TaskAllotUserTableLineLocationColumn,
  {
    "label": "距客户(km)",
    "field": "distance",
    "show": true,
    "fixed": false,
    "sortable": false,
    "width": "150px",
    "type": "column"
  },
  {
    "label": "距客户车程",
    "field": "duration",
    "show": true,
    "fixed": false,
    "sortable": false,
    "width": "150px",
    "type": "column"
  },
  TaskAllotUserTableStateColumn
]

/* 工单指派 标准版 vip版 支持列 */
export const TaskAllotUserTableStandEditionColumns = [
  ...TaskAllotUserTableCommonColumns,
  TaskAllotUserTableLineLocationColumn,
  TaskAllotUserTableStateColumn
]

export enum TaslAllotTableColumnFieldEnum {
  // 负责人
  Excutor = 'excutor',
  // 所在团队
  Tags = 'tags',
  // 名称
  DisplayName = 'displayName',
  // 权限
  Roles = 'roles',
  // 未完成
  Ufinish = 'ufinish',
  // 已完成
  Finish = 'finish',
  // 计划时间
  Plan = 'plan',
  // 工作状态
  State = 'state',
  // 好评率
  Degree = 'degree',
  // 直线距离
  LineDistance = 'lineDistance',
  // 驾车距离
  Distance = 'distance',
  // 驾车时间
  Duration = 'duration',
}


/* 工单指派 人员列表 排序方式 */
export enum AllotSortedEnum {
  // 距离最近
  Distance = 0,
  // 30天内好评率最高
  TaskDegreePercentByMonth = 1,
  // 30天工作用时最短
  TaskWorkUsedTimeByMonth = 2,
  // 30天接单最多
  ExecutorTaskByMonth = 3,
  // 30天完成最多
  FinishTaskByMonth = 4,
  // 30天完成响应最快
  TaskAcceptTimeByMonth = 5,
  // 未完成工单
  UnfinishedTask = 6,
  // 今日已完成
  FinishTaskByToday = 7,
  // 计划时间当天工单量
  PlanTaskByToday = 8,
  // 用户接单排序
  AcceptTaskByTodaySearch = 12
}

/* 工单指派 人员列表 距离 */
export enum AllotLocationEnum {
  // 5公里
  Five = 5,
  // 10公里
  Ten = 10,
  // 20公里
  Twenty = 20,
  // 50公里
  Fifty = 50,
  // 其他
  Other = 0,
  // 全部
  All = -1
}

/* 工单指派 人员列表 人员标签枚举 */
export enum AllotLabelEnum {
  // 空
  Null = '',
  // 主管
  Leader = 0,
  // 距离最近
  DistanceSort = 1,
  // 好评率前三
  DegreeTopThree = 2
}