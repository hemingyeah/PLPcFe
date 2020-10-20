// 派单方式 数据转换
export const AllotTypeConvertMap = {
  '全部': 0,
  '手动派单': 1,
  '工单池派单': 2,
  '自动派单': 3
}
// 工单标记 数据转换
export const FlagConvertMap = {
  '曾超时': 'ONCEOVERTIME',
  '曾拒绝': 'ONCEREFUSED',
  '曾暂停': 'ONCEPAUSED',
  '曾回退': 'ONCEROLLBACK',
  '位置异常': 'POSITIONEXCEPTION'
}

export const TaskSearchInputPlaceholderMap = {
  default: '请输入工单编号或工单信息',
  '按工单备注': '请输入工单备注内容',
  '按附加组件': '请输入附加组件字段值'
}

export const TaskOnceConvertMap = {
  '全部': '',
  '是': 1,
  '否': 0
}

export const TaskApproveConvertMap = {
  '全部': '',
  '审批中': 1,
  '无审批': 0
}