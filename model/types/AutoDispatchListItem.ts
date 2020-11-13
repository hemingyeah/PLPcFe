interface AutoDispatchListItem {
  // 匹配上了 候选人id	
  finalExecutorId: string | null	
  // 匹配上了 候选人名字	
  finalExecutorName: string | null
  // 匹配上了 规则id
  finalRuleId: string | null
  // 匹配上了 规则名称	
  finalRuleName: string | null
  // 被选人一号名字	匹配到的第一个人
  candidateOneName: string | null
  // 被选人二号名字 匹配到的第二个人
  candidateTwoName: string | null
  // 规则id
  id: string	
  // 租户id	
  tenantId: string
  // 规则名称
  name: string
}

export default AutoDispatchListItem