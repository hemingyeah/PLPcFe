class TaskBalanceConfig {
  /**
   * 是否开启自定义结算字段，true，不开启
  */
  public openUserDefinedBalance: boolean = true
  /**
   * 结算信息查看权限，默认为onlyHasBalanceAuthiroty，仅具有结算权限的人可以查看
  */
  public balanceViewAuthiroty: string = 'onlyHasBalanceAuthiroty'
}

export default TaskBalanceConfig