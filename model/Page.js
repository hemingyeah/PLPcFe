/** 
 * 分页用,格式对应后端返回数据 
 * 以下字段因对分页用处较小，暂不列入类中，如需使用请自行添加
 * 
 * size -- 当前页的数量
 * nextPage -- 下一页
 * prePage -- 前一页
 * firstPage -- 第一页
 * lastPage -- 最后一页
 * isFirstPage -- 是否为第一页
 * isLastPage -- 是否为最后一页
 * startRow -- 当前页面第一个元素在数据库中的行号
 * tendRow -- 当前页面最后一个元素在数据库中的行号
 */
export default class Page{
  constructor(data = {}){
    this.list = Array.isArray(data.list) ? data.list : [];// 结果集
    
    this.hasPreviousPage = !!data.hasPreviousPage; // 是否有前一页
    this.hasNextPage = data.hasNextPage !== false;// 是否有下一页
    
    this.pageNum = typeof data.pageNum == 'number' ? data.pageNum : 1;// 当前页
    this.pageSize = typeof data.pageSize == 'number' ? data.pageSize : 10;// 每页的数量
    
    this.pages = typeof data.pages == 'number' ? data.pages : 0;// 总页数
    this.total = typeof data.total == 'number' ? data.total : 0; // 总记录数
    
    this.orderBy = data.orderBy; // 排序
  }
  
  /**
   * 合并另一个page对象
   * list为两个对象的和
   * @param o - 另一页数据
   * @returns Page
   */
  merge(o){
    let otherPage = o;
    if(!(otherPage instanceof Page)) otherPage = new Page(otherPage);
    
    for(let name in this){
      if(otherPage[name] == undefined) continue;
      else if(name == 'list') this[name] = this[name].concat(otherPage[name] || []);
      else this[name] = otherPage[name];
    }
  }
  
  /**
   * 用新的page对象覆盖旧的
   * @param o - 另一页数据
   * @returns Page
   */
  cover(o) {
    let otherPage = o;
    if(!(otherPage instanceof Page)) otherPage = new Page(otherPage);
    
    for(let name in this){
      if(otherPage[name] == undefined) continue;
      this[name] = otherPage[name];
    }
  }
  
  /**
   * 根据给定对象创建一个Page实例，该T实例包含原对象的值。
   * 原对象保持不变。
   *
   * @param  {Object} o 源对象，据此创建Page实例
   * @return {Page}  包含原对象中值的Page实例
   */
  static as(data = {}){
    return new Page(data);
  }
}
