import LoginUser from '@model/entity/LoginUser/LoginUser'

class UserCardInfo {
  public static readonly Placeholder: string = '--'
  // 拒单率
  refuse: string = UserCardInfo.Placeholder
  // 转派率
  allot: string = UserCardInfo.Placeholder
  // 好评率
  degree: string = UserCardInfo.Placeholder
  // 平均工作用时
  rangeWork: string = UserCardInfo.Placeholder
  // 未完成工单
  unfinished: string = UserCardInfo.Placeholder
  // 已完成工单
  finished: string = UserCardInfo.Placeholder
  // 平均响应用时
  rangeAccept: string = UserCardInfo.Placeholder
  // 部门/团队 名称列表
  department: string[] = []
  // 用户信息
  user: LoginUser = new LoginUser()
}

export default UserCardInfo