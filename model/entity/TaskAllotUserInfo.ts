class TaskAllotUserInfo {
  // 直线距离
  lineDistance: string = ''	
  // 车程时间
  duration: string = ''
  // 车程距离	
  distance: string = ''
  // 指派人名字
  displayName: string = ''
  // 头像
  head: string = ''
  // 指派人角色列表 json 数组
  roles: string = ''
  // 满意度
  degree: string = ''
  // 未完成工单
  ufinish: string = ''
  // 已完成工单
  finish: string = ''
  // 工作状态
  state: string	= ''
  // 今日计划时间
  plan: string = ''
  // 指派人id
  userId: string= ''
  // 指派人团队列表 json 数组
  tags: string = ''	
  // 指派人标签列表 json 数组
  label: string = ''
  // 经度
  lng: string = ''
  // 纬度
  lat: string = ''
  // 最后登录时间
  lastLoginTime: string | null = null
  // 自定义属性
  attribute: { lastLocateTime: string } | null = null
}

export default TaskAllotUserInfo