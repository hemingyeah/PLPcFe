/**
 * bm 系统分页请求参数
 */
class PageInput {
  /**
   * 页码
  */
  public page?: number = 0
  
  /**
   * 每页显示数量
  */
  public pageSize?: number = 10
}

export default PageInput