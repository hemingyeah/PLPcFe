interface Sort {
  sorted?: boolean, 
  unsorted?: boolean, 
  empty?: boolean
}

interface Pageable {
  sort?: Sort,
  offset?: number,
  pageNumber?: number,
  pageSize?: number,
  paged?: boolean,
  unpaged?: boolean
}

class Page<T> {
  public content?: T | any = []
  public empty?: boolean = false
  public first?: boolean = false
  public last?: boolean = false
  public number?: number = 1
  public numberOfElements?: number = 10
  public pageable?: Pageable = {
    sort: {
      sorted: false, 
      unsorted: false, 
      empty: false
    }, 
    offset: 0,
    pageNumber: 1,
    pageSize: 10,
    paged: false,
    unpaged: false
  }
  public offset?: number = 0
  public pageNumber?: number = 1
  public pageSize?: number = 10
  public paged?: boolean = false
  public sort?: Sort = { sorted: false, unsorted: false, empty: false}
  public unpaged?: boolean = false
  public size?: number = 10
  public totalElements?: number = 1
  public totalPages?: number = 1
}

export default Page