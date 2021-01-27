enum TaskPoolNotificationTypeEnum {
  // 通知服务团队人员
  SendToTeamUser = 'sendToTeamUser',
  // 通知有权限接单用户
  SendToAuthUser = 'sendToAuthUser',
  // 其他需要通知的人
  SendToOtherUser = 'sendToOtherUser'
}

enum TaskPoolInfoEnum {
  // 工单池工单总量
  TaskPoolAllCount = 'taskPoolCount',
  // 客户服务团队待接单量
  CustomerTeamUnAcceptCount = 'customerTeamUnAcceptCount',
  // 订阅工单池用户
  SubscriptionUserCount = 'subscriptionUserCount',
  // 有权限接单用户
  HavePermissionUserCount = 'havePermissionUserCount',
}

export {
  TaskPoolNotificationTypeEnum,
  TaskPoolInfoEnum
}