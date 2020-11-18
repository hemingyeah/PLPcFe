export interface User {
  displayName: string
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
  synergies?: {
    // 名字
    displayName?: string,
    // 头像
    head?: string,
    // 钉钉人员id
    staffId?: string,
    // 用户id
    userId: string
  }[]
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
  synergies?: {
    // 名字
    displayName?: string,
    // 头像
    head?: string,
    // 钉钉人员id
    staffId?: string,
    // 用户id
    userId: string
  }[]
}

/* 派单到负责人参数 */
export interface AllotExcutorParams {
  // 工单id
  taskId: string
  // 负责人用户id
  executorId: string,
  // 转派原因
  reason?: string,
  // 协同人
  synergies?: {
    // 名字
    displayName?: string,
    // 头像
    head?: string,
    // 钉钉人员id
    staffId?: string,
    // 用户id
    userId: string
  }[]
}