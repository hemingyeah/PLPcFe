/* 字段映射 */

/* 通用映射 */
export enum CommonMappingEnum {
  // 自定义属性
  Attribute = 'attribute',
  // 客户
  Customer = 'customer',
  // 事件
  Event = 'event',
  // 产品
  Product = 'product',
  // 工单
  Task = 'task',
}

/* 字段类型映射 */
export enum FieldTypeMappingEnum {
  Address = 'address',
  Info = 'info',
  Location = 'location',
  Select = 'select',
}

/* 工单字段映射 */
export enum TaskFieldNameMappingEnum {
  // 接单用时
  AcceptUsedTimeStr = 'acceptUsedTimeStr',
  // 地址
  Address = 'address',
  // 派单方式
  AllotTypeStr = 'allotTypeStr',
  // 附件
  Attachment = 'attachment',
  // 创建人名字
  CreateUserName = 'createUserName',
  // 客户
  Customer = 'customer',
  // 负责人名字
  ExecutorName = 'executorName',
  // 信息
  Info = 'info',
  // 优先级
  Level = 'level',
  // 联系人
  Linkman = 'linkman',
  // 位置
  Location = 'location',
  // 曾超时
  OnceOverTime = 'onceOverTime',
  // 曾拒绝
  OnceRefused = 'onceRefused',
  // 曾暂停
  OncePaused = 'oncePaused',
  // 曾回退
  OnceRollback = 'onceRollback',
  // 曾转派
  OnceReallot = 'onceReallot',
  // 曾打印
  OncePrinted = 'oncePrinted',
  // 支付方式
  PaymentMethod = 'paymentMethod',
  // 计划时间
  PlanTime = 'planTime',
  // 异常标记
  PositionException = 'positionException',
  // 产品
  Product = 'product',
  // 服务内容
  ServiceContent = 'serviceContent',
  // 服务类型
  ServiceType = 'serviceType',
  // 分割线
  Separator = 'separator',
  // 工单状态
  State = 'state',
  // 协同人
  Synergies = 'synergies',
  // 是否发送短信标记
  Tick = 'tick',
  // 工单编号
  TaskNo = 'taskNo',
  // 工单客户地址
  Taddress = 'taddress',
  // 响应用时
  TaskResponseTimeStr = 'taskResponseTimeStr',
  // 工单用时
  TaskUsedTimeStr = 'taskUsedTimeStr',
  // 联系人名字
  TlmName = 'tlmName',
  // 联系人电话
  TlmPhone = 'tlmPhone',
  // 更新时间
  UpdateTime = 'updateTime',
  // 工作用时
  WorkUsedTimeStr = 'workUsedTimeStr'
}

/* 客户字段映射 */
export enum CustomerFieldNameMappingEnum {
  // 地址
  Address = 'address',
  // 客户
  Customer = 'customer',
  // 客户负责人
  CustomerManager = 'customerManager',
  // 客户负责人名字
  CustomerManagerName = 'customerManagerName',
  // 联系人
  Linkman = 'linkman',
  // 产品
  Product = 'product',
  // 编号
  SerialNumber = 'serialNumber',
  // 团队
  Tags = 'tags',
}

/* 产品字段映射 */
export enum ProductFieldNameMappingEnum {
  // 地址
  Address = 'address',
  // 客户
  Customer = 'customer',
  // 联系人
  Linkman = 'linkman',
  // 产品
  Product = 'product',
  // 编号
  SerialNumber = 'serialNumber',
  // 类型
  Type = 'type',
  // 团队
  Tags = 'tags',
}

/* 团队实体字段映射 */
export enum TagEntityMappingEnum {
  // 团队名字
  TagName = 'tagName',
}