import Base from './Base';
import _ from 'lodash'

export default class Page extends Base {
  constructor() {
    super();

    this.list = []; // 结果集
    this.size = 0; // 当前页的数量

    this.hasNextPage = true; // 是否有前一页
    this.hasPreviousPage = false; // 是否有下一页

    this.pageNum = 1; // 当前页
    this.pageSize = 10; // 每页的数量

    this.nextPage = 0; // 下一页
    this.prePage = 0; // 前一页

    this.firstPage = 1; // 第一页
    this.lastPage = 1; // 最后一页

    this.isFirstPage = true; // 是否为第一页
    this.isLastPage = true; // 是否为最后一页

    this.startRow = 1; // 当前页面第一个元素在数据库中的行号
    this.endRow = 1; // 当前页面最后一个元素在数据库中的行号

    this.pages = 0; // 总页数
    this.total = 0; // 总记录数

    this.orderBy = ''; // 排序

  }

  /**
     * 合并另一个page对象
     * list为两个对象的和
     */
  merge(otherPage) {
    if (!(otherPage instanceof Page)) throw new Error('otherPage必须为Page的实例！');

    for (let name in this) {
      if (otherPage[name] == undefined) continue;
      else if (name == 'list') this[name] = this[name].concat(otherPage[name] || []);
      else this[name] = otherPage[name];
    }
  }

  /**
     * 根据给定对象创建一个Page实例，该T实例包含原对象的值。
     * 原对象保持不变。
     *
     * @param  {Object} o 源对象，据此创建Page实例
     * @return {Page}  包含原对象中值的Page实例
     */
  static as(o) {
    return _.assign(new Page(), o);
  }
}