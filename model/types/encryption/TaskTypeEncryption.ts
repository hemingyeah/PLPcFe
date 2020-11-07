import TaskEncrptionFile from '@model/types/encryption/TaskEncrptionFile'

/**
 * @description 工单池加密配置列表
*/
class TaskTypeEncryption {
  
  // 工单类型id
  public taskTypeId: string = ''
  
  // 工单类型名称
  public taskTypeName: string = ''
  
  // 工单类型是否加密 true 加密 false 不加密
  public taskTypeEncrypt: boolean = false
  
  // 工单池加密字段
  public encrptionFilesName: string[] = []
  
  // 加密字段
  public encrptionFiles: TaskEncrptionFile[] = []
}

export default TaskTypeEncryption