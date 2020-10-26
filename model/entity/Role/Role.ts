class Role {
  // 服务工程师
  public static serviceEngineerL: String = "3";

  private id: string = ''
  // 角色名称
  private name: string = ''
  //角色描述
  private description: string = ''
  //是否默认角色
  private isSys: Number | null = null
  // 角色标识
  private rKey: string = ''
  // 权限列表,仅在新增角色权限时用过
  private authorityList: String[] = []
  // 权限
  private authoritys: any;
  // 是否自定义
  private custom: string = ''
  private isDelete: Number | null = null
}

export default Role