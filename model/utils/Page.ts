import { isUndefined, isEmpty, isArray, isBoolean, isNumber } from '@src/util/type'

const DefaultPageNumber = 1
const DefaultPageSize = 10

class Sort {
  sorted: boolean = false 
  unsorted: boolean = false
  empty: boolean = false
}

class Pageable {
  sort: Sort = new Sort()
  offset: number = 0
  pageNumber: number = DefaultPageNumber
  pageSize: number = DefaultPageSize
  paged: boolean = false
  unpaged: boolean = false
}

interface PageData<T> {
  content: T
  empty: boolean
  first: boolean
  last: boolean
  number: number
  numberOfElements: number
  offset: number
  pageable: Pageable
  size: number
  sort: Sort
  totalElements: number
  totalPages: number
}

/** 
 * @classdesc 新page对象 -- 
 * 部分属性添加了之前page对象的对应关系，暂时考虑不需要做映射或者转换 --
 * getter 取值函数为属性绑定一个函数，需要注意此属性是不可被枚举的, 没写 对应的 setter 存值函数的话，则此属性是只读的 readonly
*/
class Page<T> {
  
  constructor(data: PageData<any>) {
    this.content = isArray(data?.content) ? data.content : []
    this.empty = isBoolean(data?.empty) ? data.empty : false
    this.first = isBoolean(data?.first) ? data.first : true
    this.last = isBoolean(data?.last) ? data.last : false
    this.number = isNumber(data?.number) ? data.number : DefaultPageNumber
    this.numberOfElements = isNumber(data?.numberOfElements) ? data.numberOfElements : DefaultPageSize
    this.offset = isNumber(data?.offset) ? data.offset : 0
    this.pageable = isUndefined(data?.pageable) ? new Pageable() : data.pageable
    this.size = isNumber(data?.size) ? data.size : DefaultPageSize
    this.sort = isUndefined(data?.sort) ? new Sort() : data.sort
    this.totalElements = isNumber(data?.totalElements) ? data.totalElements : 0
    this.totalPages = isNumber(data?.totalPages) ? data.totalPages : DefaultPageNumber
	}
  
  // 内容
  public content: T | null = null
  /** 
   * 是否为空
   * 这是是后端计算的
  */
  public empty: boolean = false
  // 是否是第一页
  public first: boolean = true
  // 是否是最后一页
  public last: boolean = false
  // 页码
  public number: number = DefaultPageNumber
  public numberOfElements: number = DefaultPageSize
  // 分页数据
  public pageable: Pageable = new Pageable()
  public offset: number = 0
  // 排序
  public sort: Sort = new Sort()
  // 页大小
  public size: number = DefaultPageSize
  // 全部元素数量
  public totalElements: number = 0
  // 总页数
  public totalPages: number = DefaultPageNumber
  
  /** 
   * @description 是否为空
   * 这是是前端计算的
  */
  public get isEmpty(): boolean {
    return isEmpty(this.content)
  }
  
  // 是否为最后一个
  public get isLast(): boolean {
    return !this.hasNextPage
  }
  
  // 是否有上一页
  public get hasPreviousPage(): boolean {
    return !this.first
  }
  
  // 是否有下一页
  public get hasNextPage(): boolean {
    return this.number + 1 < this.totalPages
  }
  
  // 页码
  public get pageNumber(): number {
    return this.number
  }
  
  // 页大小
  public get pageSize(): number {
    return this.size || DefaultPageSize
  }
  
  // 全部页数
  public get pages(): number {
    return this.totalPages
  }
  
  // 全部元素数量
  public get total(): number {
    return this.totalElements
  }
  
  /**
   * @description 合并另一个相同的page对象
   * content 为 两个对象的和
   * @param data - 另一个页面数据
  */
  merge(data: PageData<T>){
    let otherPage: Page<T> | PageData<T> = data
    if(!(otherPage instanceof Page)) otherPage = new Page(data)
    
    let isContentProperty: boolean = false
    let otherPagevalue: any = null
    
    for (let property in this) {
      // @ts-ignore
      otherPagevalue = otherPage[property]
      
      if(isUndefined(otherPagevalue)) continue
      
      // @ts-ignore
      this[property] = isContentProperty ? this[property].concat(otherPagevalue || []) : otherPagevalue
    }
  }
  
  /**
   * @description 用新的page对象覆盖旧的
   * @param data - 另一个页面数据
  */
  cover(data: Page<T>) {
    let otherPage: Page<T> | PageData<T> = data
    if(!(otherPage instanceof Page)) otherPage = new Page(data)
    
    let otherPagevalue: any = null
    
    for(let property in this){
      // @ts-ignore
      otherPagevalue = otherPage[property]
      
      if (isUndefined(otherPagevalue)) continue
      
      // @ts-ignore
      this[property] = otherPagevalue
    }
  }
}

export default Page