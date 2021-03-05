// 租户数据限制来源枚举
enum TenantDataLimitSourceEnum {
  // 工单
  Task = 1,
  // 客户
  Customer = 2,
  // 事件
  Event = 3,
  // 产品
  Product = 4,
  // 备件
  SparePart = 5,
  // 文档库
  Wiki = 6,
  // 通知公告
  Notice = 7,
  // 团队
  Tag = 8,
  // 计划任务
  PlanTask = 9,
  // 服务项目
  Service = 10
}

export default TenantDataLimitSourceEnum