class Department {

  /**
   * 主键UUID
  */
  private id: string = ''
  /**
   * 部门名称
  */
  private name: string = ''
  /**
   * 描述
  */
  private description: string = ''
  /**
   * 部门类型
  */
  private type: string = ''
  /**
   * 上级部门
  */
  private parentId: string = ''
  /**
   * 钉钉部门id
  */
  private dingId: string = ''
  /**
   * 逻辑删除0：未删除
  */
  private isDelete: Number = 0
  /**
   * 同步通讯录临时钉钉部门ID
  */
  private synDingId: string = ''
  /**
   * 子部门
  */
  private subDepartments: Department[] = []
}

export default Department