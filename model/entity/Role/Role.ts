class Role {
  // 服务工程师
  public static serviceEngineerL: String = "3";
  
  public id: string = ''
  // 角色名称
  public name: string = ''
  //角色描述
  public description: string = ''
  //是否默认角色
  public isSys: Number | null = null
  // 角色标识
  public rKey: string = ''
  // 权限列表,仅在新增角色权限时用过
  public authorityList: String[] = []
  // 权限
  public authoritys: any;
  // 是否自定义
  public custom: string = ''
  public isDelete: Number | null = null
}

export default Role