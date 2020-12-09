/** 
 * 工单地址
*/
class TaskAddress {
  // 区
  public dist?: string = ''
  // 省
  public province?: string = ''
  // 市
  public city?: string = ''
  // 详细地址 地址长度必须小于1000
  public address?: string = ''
  // 经度
  public longitude?: number | null = null
  // 纬度
  public latitude?: number | null = null
  // 标识
  public id: string = ''
  // 是否有效地址
  public get validAddress(): boolean {
    return Boolean(this.longitude && this.latitude)
  }
  
  public toString(): string {
    const AddressList = [this.province, this.city, this.dist, this.address]
    return AddressList.filter((item: string | undefined) => Boolean(item)).join()
  }
  
  constructor(taskAddress?: TaskAddress) {
    let { province, city, dist, address, latitude, longitude, id } = taskAddress || {}
    
    this.dist = dist || ''
    this.province = province || ''
    this.city = city || ''
    this.address = address || ''
    this.latitude = latitude || null
    this.longitude = longitude || null
    this.id = id || ''
  }

}

export default TaskAddress
