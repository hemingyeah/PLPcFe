// 租户数据限制类型枚举
enum TenantDataLimitTypeEnum {
  // 工单
  Task = 'task',
  // 客户数据
  Customer = 'customer',
  // 事件
  Event = 'event',
  // 产品
  Product = 'product',
  // 产品模板
  ProductTemplate = 'productTemplate',
  // 产品二维码
  ProductCode = 'productCode',
  // 备件
  SparePart = 'sparepart',
  // 文档库
  Wiki = 'wiki',
  // 通知公告
  Notice = 'notice',
  // 团队
  Tag = 'tag',
  // 计划任务
  PlanTask = 'planTask',
  // 服务项目
  Service = 'service'
}

export default TenantDataLimitTypeEnum