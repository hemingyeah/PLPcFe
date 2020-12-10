class DispatchRule {
  public static Task: string = 'task'
  public static Event: string = 'event'
  
  private id: string = ''
  private name: string = ''
  // 按照什么条件
  private according: string = ''
  // 具体条件 根据according不同存值格式也不同
  private condition: any = {}
  // 候选人 记录userId userName times 被自动分配的次数
  private candidate: any = {}
  // 优先级
  private level: number | null = null
  private enabled: number = 1
  // 用于哪个模块 event task
  private module: string = DispatchRule.Task
}

export default DispatchRule