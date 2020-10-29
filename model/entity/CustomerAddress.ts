/** 
 * 客户地址
*/
class CustomerAddress {
  // 国家
  public adCountry?: string = ''
  // 区
  public adDist?: string = ''
  // 省
  public adProvince?: string = ''
  // 市
  public adCity?: string = ''
  // 详细地址 地址长度必须小于1000
  public adAddress?: string = ''
  // 经度
  public adLongitude?: number | null = null
  public adLatitude?: number | null = null
  // 地址类型：0 默认的选项选址，1 新加的地图选址
  public addressType: number = 0
  // 是否有效地址
  public get validAddress(): boolean {
    const AddressList = [this.adProvince, this.adCity, this.adDist, this.adAddress]
    return AddressList.every((item: string | undefined) => Boolean(item))
  }
  
  public toString(): string {
    const AddressList = [this.adProvince, this.adCity, this.adDist, this.adAddress]
    return AddressList.filter((item: string | undefined) => Boolean(item)).join()
  }
}

export default CustomerAddress
