import LoginUser from '@model/entity/LoginUser/LoginUser'

class TaskPoolUser {
  // 未完成工单数量
  unFinished: number = 0
  // 用户信息
  user: LoginUser = new LoginUser()
}

export default TaskPoolUser