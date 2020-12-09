import CustomerAddress from '@model/entity/CustomerAddress'
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Time from '@model/entity/Time'

class Customer extends Time<String> {
  // 客户启用
  public static customerStatus?: number = 1;
  public static ENABLED?: number = 1
  public static DIS_ENABLED?: number = 0
  public id?: string = ''
  // 客户名称长度必须小于1000
  public name?: string = ''
  public enName?: string = ''
  // 客户编号，用来保证对外的唯一性
  // 客户编号长度必须小于1000
  public serialNumber?: string = ''
  public status?: number | null = null
  public level?: string = ''
  public superior?: number | null = null
  // 团队id
  public teamId?: number | null = null
  // 客户负责人
  public customerManager?: string = ''
  // 客户负责人名字
  public customerManagerName?: string = ''
  public remark?: string = ''
  public industry?: string = ''
  public type?: string = ''
  // 出于性能考虑，弃用
  public taskCount?: string = ''
  // 出于性能考虑，弃用
  public productCount?: string = ''
  // 是否删除
  public isDelete?: number | null = null
  public attribute?: any = {}
  public companyNature?: string = ''
  // 已废弃
  public tagIds?: string = ''
  // //用户团队列表
  public tags?: any[] = []
  // 创建人
  public createUser?: string = ''
  // 创建人用户id
  public createUserId?: string = ''
  // 创建人用户
  public createLoginUser?: LoginUser = new LoginUser()
  
  /** 联系人信息 联系人姓名长度必须小于1000 */
  public lmName?: string = ''
  public lmPhone?: string = ''
  public lmEmail?: string = ''
  public isFocus?: boolean = false
  // 客户地址
  public customerAddress?: CustomerAddress = new CustomerAddress()
  
  public source?: string = ''
  
  // 行业（用户向导示例数据使用）
  public guideProfessions?: string[] = [];
  // 是否为示例数据
  public isGuideData?: boolean = false
}

export default Customer
