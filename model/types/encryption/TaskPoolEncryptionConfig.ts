import TaskTypeEncryption from '@model/types/encryption/TaskTypeEncryption'

/**
 * @description 工单池加密配置
*/
class TaskPoolEncryptionConfig {
  
  //  1 开始 其他关闭
  public open: number = 0
  
  //工单池加密列表
  public taskTypeEncryptionList: TaskTypeEncryption[] = []
  
  //系统的字段
  public systemEncryptionList: TaskTypeEncryption[] = []
  
  //扩展字段
  public extEncyptionList: TaskTypeEncryption[] = []
}

export default TaskPoolEncryptionConfig