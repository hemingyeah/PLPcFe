/** 
 * @description 权限
 * 值为1 -> 个人权限
 * 值为2 -> 团队权限
 * 值为3 -> 全部权限
*/

enum AuthEnum {
  // 工单新建
  TASK_ADD = 'TASK_ADD',
  // 产品新建
  PRODUCT_CREATE = 'PRODUCT_CREATE',
  // 客户新建
  CUSTOMER_CREATE = 'CUSTOMER_CREATE',
  // 在线支付
  VIP_PAYMENT_ONLINE = 'VIP_PAYMENT_ONLINE',
  // 工单批量状态
  TASK_BATCH_DISPATCH = 'TASK_BATCH_DISPATCH',
  // 事件新建 ？
  CASE_ADD = 'CASE_ADD',
  // 事件新建 ？
  SERVICE_CREATE = 'SERVICE_CREATE',
  // 事件查看
  CASE_VIEW = 'CASE_VIEW',
  // 工单编辑
  TASK_EDIT = 'TASK_EDIT',
  // 工单回访
  TASK_FEEDBACK = 'TASK_FEEDBACK',
  // 通知公告查看？
  VIP_INFO_NOTICE_SELECT = 'VIP_INFO_NOTICE_SELECT',
  // 登录PC端
  LOGIN_PC = 'LOGIN_PC',
  // 短信配置
  SMS_CONFIG = 'SMS_CONFIG',
  // 通知公告创建？
  VIP_INFO_NOTICE_CREATE = 'VIP_INFO_NOTICE_CREATE',
  // 事件编辑？
  SERVICE_EDIT = 'SERVICE_EDIT',
  // 产品编辑
  PRODUCT_EDIT = 'PRODUCT_EDIT',
  // 工单派单
  TASK_DISPATCH = 'TASK_DISPATCH',
  // 工单池权限
  TASK_POOL = 'TASK_POOL',
  // 日报
  VIP_REPORT_VIEW = 'VIP_REPORT_VIEW',
  // 工单查看
  TASK_VIEW = 'TASK_VIEW',
  // 角色管理？
  AUTH_STAFF = 'AUTH_STAFF',
  // 权限管理？
  AUTH_ROLE = 'AUTH_ROLE',
  // 工单关闭
  TASK_CLOSE = 'TASK_CLOSE',
  // 工单批量关闭 
  TASK_BATCH_CLOSE = 'TASK_BATCH_CLOSE',
  // 备件个人库
  VIP_SPAREPART_PERSION = 'VIP_SPAREPART_PERSION',
  // 文档库编辑
  INFO_EDIT = 'INFO_EDIT',
  // 备件出入库
  VIP_SPAREPART_INOUT = 'VIP_SPAREPART_INOUT',
  // 工单审核结算
  TASK_AUDIT = 'TASK_AUDIT',
  // 产品查看
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  // 客户删除
  CUSTOMER_DELETE = 'CUSTOMER_DELETE',
  // 事件删除
  CASE_DELETE = 'CASE_DELETE',
  // 通知公告查看
  INFO_VIEW = 'INFO_VIEW',
  // 导入
  EXPORT_IN = 'EXPORT_IN',
  // 审批？
  VIP_APPROVE = 'VIP_APPROVE',
  // 备件V1编辑？
  PART_EDIT = 'PART_EDIT',
  // 事件查看
  SERVICE_VIEW = 'SERVICE_VIEW',
  // 客户查看
  CUSTOMER_VIEW = 'CUSTOMER_VIEW',
  // 备件V2新建
  VIP_SPAREPART_CREATE = 'VIP_SPAREPART_CREATE',
  // 备件V2查看
  VIP_SPAREPART_VIEW = 'VIP_SPAREPART_VIEW',
  // 二维码
  CUSTOMER_PQRCODE = 'CUSTOMER_PQRCODE',
  // 工单删除
  TASK_DELETE = 'TASK_DELETE',
  // 工单计划任务
  VIP_TASK_PLAN = 'VIP_TASK_PLAN',
  // 产品删除
  PRODUCT_DELETE = 'PRODUCT_DELETE',
  // 事件编辑
  CASE_EDIT = 'CASE_EDIT',
  // 文档库创建
  VIP_INFO_CREATE = 'VIP_INFO_CREATE',
  // 系统设置
  SYSTEM_SEETING = 'SYSTEM_SEETING',
  // 登录移动端
  LOGIN_YD = 'LOGIN_YD',
  // 备件V2编辑
  VIP_SPAREPART_EDIT = 'VIP_SPAREPART_EDIT',
  // 备件V1查看
  PART_VIEW = 'PART_VIEW',
  // 团队
  AUTH_TAG = 'AUTH_TAG',
  // 备件V2库存
  VIP_SPAREPART_STOCK = 'VIP_SPAREPART_STOCK',
  // 工单批量结算
  TASK_BATCH_AUDIT = 'TASK_BATCH_AUDIT',
  // 客户编辑
  CUSTOMER_EDIT = 'CUSTOMER_EDIT',
}

export default AuthEnum