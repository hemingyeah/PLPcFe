/** 
 * 客户地址
*/
class CustomerAddress {
  // 国家
  private adCountry?: string = ''
  // 区
  private adDist?: string = ''
  // 省
  private adProvince?: string = ''
  // 市
  private adCity?: string = ''
  // 详细地址 地址长度必须小于1000
  private adAddress?: string = ''
  // 经度
  private adLongitude?: number | null = null
  private adLatitude?: number | null = null
  // 地址类型：0 默认的选项选址，1 新加的地图选址
  private addressType: number = 0
  // 是否有效地址
  private get validAddress(): boolean {
    const AddressList = [this.adProvince, this.adCity, this.adDist, this.adAddress]
    return AddressList.every((item: string | undefined) => Boolean(item))
  }
  
  public toString(): string {
    const AddressList = [this.adProvince, this.adCity, this.adDist, this.adAddress]
    return AddressList.filter((item: string | undefined) => Boolean(item)).join()
  }
}

export default CustomerAddress
