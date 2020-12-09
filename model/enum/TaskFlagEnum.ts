/**
 * 工单标记搜索条件(如: 曾退回、曾超时)
*/
enum TaskFlagEnum {
  // 曾超时
  ONCEOVERTIME = 'onceOverTime',
  // 曾拒绝
  ONCEREFUSED = 'onceRefused',
  // 曾暂停
  ONCEPAUSED = 'oncePaused',
  // 曾回退
  ONCEROLLBACK = 'onceRollback',
  // 位置异常
  POSITIONEXCEPTION = 'positionException'
}

export default TaskFlagEnum