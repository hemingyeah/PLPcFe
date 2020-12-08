/** 
 * @description 权限
 * 值为1 -> 个人权限
 * 值为2 -> 团队权限
 * 值为3 -> 全部权限
*/
interface Auth {
  // 工单新建
  TASK_ADD?: number
  // 产品新建
  PRODUCT_CREATE?: number
  // 客户新建
  CUSTOMER_CREATE?: number
  // 在线支付
  VIP_PAYMENT_ONLINE?: number
  // 工单批量状态
  TASK_BATCH_DISPATCH?: number
  // 事件新建 ？
  CASE_ADD?: number
  // 事件新建 ？
  SERVICE_CREATE?: number
  // 事件查看
  CASE_VIEW?: number
  // 工单编辑
  TASK_EDIT?: number
  // 工单回访
  TASK_FEEDBACK?: number
  // 通知公告查看？
  VIP_INFO_NOTICE_SELECT?: number
  // 登录PC端
  LOGIN_PC?: number
  // 短信配置
  SMS_CONFIG?: number
  // 通知公告创建？
  VIP_INFO_NOTICE_CREATE?: number
  // 事件编辑？
  SERVICE_EDIT?: number
  // 产品编辑
  PRODUCT_EDIT?: number
  // 工单派单
  TASK_DISPATCH?: number
  // 工单池权限
  TASK_POOL?: number
  // 日报
  VIP_REPORT_VIEW?: number
  // 工单查看
  TASK_VIEW?: number
  // 角色管理？
  AUTH_STAFF?: number
  // 权限管理？
  AUTH_ROLE?: number
  // 工单关闭
  TASK_CLOSE?: number
  // 工单批量关闭 
  TASK_BATCH_CLOSE?: number
  // 备件个人库
  VIP_SPAREPART_PERSION?: number
  // 文档库编辑
  INFO_EDIT?: number
  // 备件出入库
  VIP_SPAREPART_INOUT?: number
  // 工单审核结算
  TASK_AUDIT?: number
  // 产品查看
  PRODUCT_VIEW?: number
  // 客户删除
  CUSTOMER_DELETE?: number
  // 事件删除
  CASE_DELETE?: number
  // 通知公告查看
  INFO_VIEW?: number
  // 导入
  EXPORT_IN?: number
  // 审批？
  VIP_APPROVE?: number
  // 备件V1编辑？
  PART_EDIT?: number
  // 事件查看
  SERVICE_VIEW?: number
  // 客户查看
  CUSTOMER_VIEW?: number
  // 备件V2新建
  VIP_SPAREPART_CREATE?: number
  // 备件V2查看
  VIP_SPAREPART_VIEW?: number
  // 二维码
  CUSTOMER_PQRCODE?: number
  // 工单删除
  TASK_DELETE?: number
  // 工单计划任务
  VIP_TASK_PLAN?: number
  // 产品删除
  PRODUCT_DELETE?: number
  // 事件编辑
  CASE_EDIT?: number
  // 文档库创建
  VIP_INFO_CREATE?: number
  // 系统设置
  SYSTEM_SEETING?: number
  // 登录移动端
  LOGIN_YD?: number
  // 备件V2编辑
  VIP_SPAREPART_EDIT?: number
  // 备件V1查看
  PART_VIEW?: number
  // 团队
  AUTH_TAG?: number
  // 备件V2库存
  VIP_SPAREPART_STOCK?: number
  // 工单批量结算
  TASK_BATCH_AUDIT?: number
  // 客户编辑
  CUSTOMER_EDIT?: number
}

export default Auth