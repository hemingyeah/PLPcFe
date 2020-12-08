/** 
 * 分页排序查询类
 * 用于自定义字段查询
*/
interface PageModel {
  // 距离默认为5000米
  distance?: number
  // 新排序标识
  orderDetail?: Map<String, Boolean>;
  // 每页数量，默认为10
  pageSize?: number
  // 页码，默认为1
  pageNum?: number
  // 旧排序标识
  sortBy?: Map<String, Boolean>
}

export default PageModel