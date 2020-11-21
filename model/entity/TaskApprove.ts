class TaskApprove {
  // 工单节点
  action?: string = ''
  // 地址
  address?: string = ''
  // 审批人名字  值等于请选择是为 由发起人选择
  approversName?: string = ''
  // 纬度
  latitude?: number = 0
  // 经度
  longitude?: number = 0
  // 工单id
  taskId?: string = ''
  // 用户信息 json
  userJson?: string = ''
  // 是否需要审批
  needApprove: boolean = false
  // 转派说明
  reason?: string = ''
  
  auto?: boolean = false
  designatorInfo?: string = ''
}

export default TaskApprove