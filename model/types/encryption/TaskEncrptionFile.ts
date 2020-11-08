/**
 * @description 加密字段
*/
class TaskEncrptionFile {
  
  /**
   * 字段key
  */
  public fieldName: string = ''
  
  /**
   * 字段名
  */
  public displayName: string = ''
  
  /**
   * 是否为系统字段 1 是 0 不是
  */
  public isSystem: number = 0
  
  /**
   * 是否显示 1勾选  其他不勾选
  */
  public isTick: number = 0
  
  /**
   * 客户字段名
  */
  public typeName: string = ''
  
}

export default TaskEncrptionFile
