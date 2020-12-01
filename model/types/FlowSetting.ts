import LoginUser from '@model/entity/LoginUser/LoginUser'

class FlowSetting {
  // 是否开启
  state: boolean = false
  // 超时时间
  overTime: number = 0
  // 审批人列表
  approvers: LoginUser[] = []
  // 审批leader
  leader: string = ''
  // 工单字段id
  taskTemplateId: string = ''
  // 字段名字
  displayName: string = ''
}

export default FlowSetting