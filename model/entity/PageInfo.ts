class PageInfo<T> {
  //当前页
  public pageNum: number = 10
  //每页的数量
  public pageSize: number = 1
  // 当前页的数量
  public size: number  = 10
  //排序
  public orderBy: string = ''
  
  // 由于startRow和endRow不常用，这里说个具体的用法
  // 可以在页面中"显示startRow到endRow 共size条数据"
  // 当前页面第一个元素在数据库中的行号
  public startRow: number = 0
  // 当前页面最后一个元素在数据库中的行号
  public endRow: number = 0
  // 总记录数
  public total: number = 0
  // 总页数
  public pages: number = 0
  // 结果集
  public list: T[] = []
  
  // 第一页
  public firstPage: number = 0
  // 前一页
  public prePage: number = 0
  // 下一页
  public nextPage: number = 0
  // 最后一页
  public lastPage: number = 0
  
  // 是否为第一页
  public isFirstPage: boolean  = false
  // 是否为最后一页
  public isLastPage: boolean = false
  // 是否有前一页
  public hasPreviousPage: boolean = false
  // 是否有下一页
  public hasNextPage: boolean = false
  // 导航页码数
  public navigatePages: number = 0
  // 所有导航页号
  public navigatepageNums: number[] = []
}

export default PageInfo