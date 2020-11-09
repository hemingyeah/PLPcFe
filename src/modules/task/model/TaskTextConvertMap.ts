/*审批状态 */
export const ApproveTextConvert = {
  '1': '审批中',
  '0': '无审批'
}
/*曾打印 */

export const OncePrintedTextConvert = {
  '1': '是',
  '0': '否'
}
/*工单类型 */
export const StateTextConvert = {
  "created": "待指派",
  "allocated": "已指派",
  "accepted": "已接受",
  "processing": "进行中",
  "finished": "已完成",
  "refused": "已拒绝",
  "costed": "已结算",
  "closed": "已关闭",
  "offed": "已取消",
  "taskPool": "工单池",
  "unfinished": "未完成",
}
/*异常标记 */
export const FlagTextConvert = {
  'ONCEOVERTIME': '曾超时',
  'ONCEREFUSED': '曾拒绝',
  'ONCEPAUSED': '曾暂停',
  'ONCEROLLBACK': '曾回退',
  'POSITIONEXCEPTION': '位置异常'
}
/**派单方式 */
export const AllotTypeTextConvert = {
  '1':'手动派单',
  '2': '工单池派单',
  '3': '自动派单'
}