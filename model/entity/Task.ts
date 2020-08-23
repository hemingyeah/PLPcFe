interface Task {
  // 系统附件
  attachment ?: String[];
  // 自定义字段
  attribute ?: Object;
  // 任务描述
  description ?: String;
  // 优先级
  level ?: String;
  // 计划时间
  planTime ?: String;
  // 产品 (JSON格式)
  products ?: String[];
  // 服务内容
  serviceContent ?: String;
  // 服务类型
  serviceType ?: String;
  // 工单类型id
  templateId ?: String;
  // 工单类型名称
  templateName ?: String;

}

export default Task