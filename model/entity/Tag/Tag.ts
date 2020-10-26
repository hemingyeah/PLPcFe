import TagAddress from '@model/entity/Tag/TagAddress'
import TagPlace from '@model/entity/Tag/TagPlace'

class Tag {
  
  private static serialVersionUID: any
  
  private id: String = ''
  private tenantId: String= ''
  // 标签名字
  private tagName: String = ''
  // 标签颜色
  private tagColor: String = ''
  // 创建时间
  private createTime: Date | string = ''
  // 团队主管
  private teamLeaders: any[] = []
  // 主团队
  private parent: Tag = new Tag()
  // 子团队
  private children: Tag[] = []
  // 描述
  private description: string = ''
  //联系方式
  private phone: string = ''
  //团队位置
  private tagAddress: TagAddress = new TagAddress()
  //负责区域
  private tagPlaceList: TagPlace[] = []
}

export default Tag