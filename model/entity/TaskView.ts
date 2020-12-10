import TaskSearchModel from '@model/entity/TaskSearchModel'

/* 工单视图 */
interface TaskView {

  /**
   * 视图别名
  */
  alias?: string
  /**
   * 创建时间
  */
  createTime?: Date
  /**
   * 该字段未启用
  */
  conditions?: string
  /**
   * 描述
  */
  description?: string
  /**
   * 视图ID
  */
  id?: string
  /**
   * 模块名称
  */
  model?: string
  /**
   * 视图名称
  */
  name?: string
  /**
   * 作用域  默认/只有我/所有用户
  */
  region?: '默认' | '只有我' | '所有用户'
  /**
   * 搜索条件JSON
  */
  searchModel?: TaskSearchModel
  /**
   * 视图状态
  */
  state?: number
  /**
   * 选择列
  */
  selectedCols?: string
  /**
   * 中文版的视图搜索条件
  */
  searchModelCN?: Map<String, String>
  /**
   * 租户id
  */
  tenantId?: string
  /**
   * 用户ID
  */
  userId?: string

  /* 以下是前端用的 */
  title?: string

}

export default TaskView
