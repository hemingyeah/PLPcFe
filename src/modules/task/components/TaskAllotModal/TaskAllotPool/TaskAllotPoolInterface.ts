export interface TaskAllotPoolInfoData {
  // 工单池工单总量
  taskPoolAllCount: number,
  // 客户服务团队待接单量
  customerTeamUnAcceptCount: number,
  // 订阅工单池用户数量
  subscriptionUserCount: number,
  // 有权限接单用户
  havePermissionUserCount: number
}