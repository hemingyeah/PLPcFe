export interface User {
  displayName?: string
  head?: string
  staffId?: string
  userId: string
}

/* 部门多选选人返回结果 */
export interface DepeMultiUserResult { 
  status: number, 
  data: { 
    users: User[] 
  } 
}

/* 指派审批参数 */
export interface TaskAllotApproveParams {
  // 工单id
  taskId: string,
}

/* 自动派单审批参数 */
export interface AutoDispatchApproveParams {
  // 工单id
  taskId: string,
  // 预估匹配结果
  estimatedMatches?: {
    // 候选人id
    finalExecutorId: string,
    // 候选人名称
    finalExecutorName: string,
    // 规则id
    finalRuleId: string,
    // 规则名称
    finalRuleName: string	
  },
  /* 协同人列表 */
  synergies?: User[]
}

/* 自动派单参数 */
export interface AutoDispatchParams {
  // 工单id
  taskId: string,
  // 负责人ID 传入死值
  executorId: 'auto_dispatch',
  // 预估匹配结果
  autoDispatchInfo?: {
    // 候选人id
    finalExecutorId: string,
    // 候选人名称
    finalExecutorName: string,
    // 规则id
    finalRuleId: string,
    // 规则名称
    finalRuleName: string	
  },
  /* 协同人列表 */
  synergies?: User[]
}

/* 派单到负责人参数 */
export interface AllotExcutorParams {
  // 工单id
  taskId: string,
  // 负责人用户id
  executorId: string,
  // 转派原因
  reason?: string,
  // 协同人
  synergies?: User[]
}

/* 派单到工单池参数 */
export interface AllotTaskPoolParams {
  // 工单id
  taskId: string,
  // 负责人用户id
  executorId?: string,
  // 内容
  content?: string,
  // 是否通知客户团队成员
  noticeCusTag: boolean,
  // 通知有权限接单人员
  authTaskPoolUser: boolean,
  // 其他额外通知人
  otherNotifier?: User[]
  // 协同人
  synergies?: User[],
}

/* 转派到工单池参数 */
export interface ReAllotTaskPoolParams {
  // 工单id
  taskId: string
  // 负责人用户id  task_pool
  executorId: string,
  // 工单状态
  state: string,
  // 转派原因
  reason?: string,
  // 到工单池
  toPool: boolean,
  // 协同人
  synergies?: User[]
}