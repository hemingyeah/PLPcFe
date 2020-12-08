class Time<T> {
  // 创建人
  public createUser?: T | null = null
  // 更新人
  public updateUser?: T | null = null
  // 创建时间
  public createTime?: string | number | null = null
  // 更新时间
  public updateTime?: string | number | null = null
}

export default Time