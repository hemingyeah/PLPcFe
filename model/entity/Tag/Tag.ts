import TagAddress from '@model/entity/Tag/TagAddress'
import TagPlace from '@model/entity/Tag/TagPlace'

class Tag {
  
  public static serialVersionUID: any
  
  public id?: string = ''
  public tenantId?: string= ''
  // 标签名字
  public tagName?: string = ''
  // 标签颜色
  public tagColor?: string = ''
  // 创建时间
  public createTime?: Date | string = ''
  // 团队主管
  public teamLeaders?: any[] = []
  // 主团队
  public parent?: Tag = new Tag()
  // 子团队
  public children?: Tag[] = []
  // 描述
  public description?: string = ''
  //联系方式
  public phone?: string = ''
  //团队位置
  public tagAddress?: TagAddress = new TagAddress()
  //负责区域
  public tagPlaceList?: TagPlace[] = []
}

export default Tag