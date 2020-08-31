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
  Location = 'location'
}

/* 工单字段映射 */
export enum TaskFieldNameMappingEnum {
  // 地址
  Address = 'address',
  // 客户
  Customer = 'customer',
  // 联系人
  Linkman = 'linkman',
  // 计划时间
  PlanTime = 'planTime',
  // 产品
  Product = 'product',
  // 是否发送短信标记
  Tick = 'tick',
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