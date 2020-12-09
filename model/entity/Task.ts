interface Task {
  // 系统附件
  attachment ?: string[];
  // 自定义字段 object
  attribute ?: any;
  // 任务描述
  description ?: string;
  id: string
  // 优先级
  level ?: string;
  // 计划时间
  planTime ?: string;
  // 产品 (JSON格式)
  products ?: string[];
  // 服务内容
  serviceContent ?: string;
  // 服务类型
  serviceType ?: string;
  // 工单类型id
  templateId ?: string;
  // 工单类型名称
  templateName ?: string;

}

export default Task