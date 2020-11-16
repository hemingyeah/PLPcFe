/* 工单指派 通用表格列 */
const TaskAllotUserTableCommonColumns = [
  {
    "label": "设为负责人",
    "field": "excutor",
    "show": true,
    "fixed": false,
    "minWidth": "100px",
    "type": "column"
  },
  {
    "label": "员工",
    "field": "displayName",
    "show": true,
    "fixed": false,
    "minWidth": "150px",
    "type": "column",
    "disabled": true
  },
  {
    "label": "员工角色",
    "field": "userRole",
    "show": true,
    "fixed": false,
    "minWidth": "150px",
    "type": "column"
  },
  {
    "label": "未完成工单",
    "field": "unfinishedTask",
    "show": true,
    "fixed": false,
    "sortable": true,
    "minWidth": "150px",
    "type": "column"
  },
  {
    "label": "今日已完成",
    "field": "todayFinishedTask",
    "show": true,
    "fixed": false,
    "sortable": true,
    "minWidth": "150px",
    "type": "column"
  },
  {
    "label": "计划时间当天工单量",
    "field": "plantimeTodayTaskNum",
    "show": true,
    "fixed": false,
    "sortable": true,
    "minWidth": "180px",
    "type": "column"
  },
  {
    "label": "好评率",
    "field": "favorableRating",
    "show": true,
    "fixed": false,
    "sortable": true,
    "minWidth": "150px",
    "type": "column"
  }
]

/* 工单指派 工作状态列 */
const TaskAllotUserTableStateColumn = {
  "label": "工作状态",
  "field": "userState",
  "show": true,
  "fixed": false,
  "sortable": true,
  "minWidth": "150px",
  "type": "column"
}

export enum TaslAllotTableColumnFieldEnum {
  Excutor = 'excutor',
  DisplayName = 'displayName',
  UserRole = 'userRole',
  unfinishedTask = 'unfinishedTask',
  TodayFinishedTask = 'todayFinishedTask',
  PlantimeTodayTaskNum = 'plantimeTodayTaskNum',
  FavorableRating = 'favorableRating',
  Location = 'location',
  Drive = 'drive',
}

/* 工单指派 企业版支持列 */
export const TaskAllotUserTableEnterpriseEditionColumns = [
  ...TaskAllotUserTableCommonColumns,
  {
    "label": "距客户(KM)",
    "field": "location",
    "show": true,
    "fixed": false,
    "sortable": true,
    "minWidth": "150px",
    "type": "column"
  },
  {
    "label": "距客户车程",
    "field": "drive",
    "show": true,
    "fixed": false,
    "sortable": true,
    "minWidth": "150px",
    "type": "column"
  },
  TaskAllotUserTableStateColumn
]

/* 工单指派 标准版 vip版 支持列 */
export const TaskAllotUserTableStandEditionColumns = [
  ...TaskAllotUserTableCommonColumns,
  {
    "label": "距客户(KM)",
    "field": "location",
    "show": true,
    "fixed": false,
    "sortable": true,
    "minWidth": "150px",
    "type": "column"
  },
  TaskAllotUserTableStateColumn
]