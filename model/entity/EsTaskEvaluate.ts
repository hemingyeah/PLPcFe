class EsTaskEvaluate {
  // 主键Id
  public id?: string | null = null
  // 工单或者事件Id
  public behaviorId?: string | null = null
  // 预留星级评价1
  public starEvaluate1?: number | null = null
  // 预留星级评价2
  public starEvaluate2?: number | null = null
  // 预留星级评价3
  public starEvaluate3?: number | null = null
  // 预留星级评价4
  public starEvaluate4?: number | null = null
  // 预留星级评价5
  public starEvaluate5?: number | null = null
  // 预留星级评价5
  public starEvaluate6?: number | null = null
  // 标签评价列表用于页面显示
  public tagEvaluates?: string[] = []
  // 用于保存在评价时的服务评星自定义名称
  public starEvaluates?: string[] = []
  // 备注
  public remark?: string | null = null
}

export default EsTaskEvaluate