class TagAddress {
  private province: string = ''
  private city: string = ''
  private dist: string = ''
  private address: string = ''
  private longitude: Number | null = null
  private latitude: Number | null = null
  // 地址类型：0默认的选项选址，1新加的地图选址
  private addressType: Number = 0
  
  /**
   * 把省市区拼接起来
   * @param delimiter 分隔符
   * @return
   */
  public concatAddress(delimiter: String): String {
    return [this.province, this.city, this.dist, this.address].filter(item => !!item).join(',');
  }
}

export default TagAddress