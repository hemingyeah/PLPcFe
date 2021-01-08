import Tag from '@model/entity/Tag/Tag'
import Role from '@model/entity/Role/Role'
import Department from '@model/entity/Department/Department'

class LoginUser {
  public static serialVersionUID?: any
  public userId: string = ''
  // 登录用户名
  public loginName?: string = ''
  public loginPassword?: string = ''
  // 登录密码
  public salt?: string = ''
  // 姓名
  public displayName?: string = ''
  // 邮箱
  public email?: string = ''
  // 手机号
  public cellPhone?: string = ''
  // 上次登录时间
  public lastLoginTime?: string = ''
  // 启用状态
  public enabled?: number | null = null
  // 微信id
  public weixinid?: string = ''
  public powercode?: string = ''
  public head?: string = ''
  public sex?: string = ''
  // 是否为第一次登录标记
  public firstLogin?: number | null = null
  // 用户的所有标签
  public tagList?: Tag[] = []
  public departments?: Department[] = []
  public roles?: Role[] = []
  public attribute?: any = {}
  public openid?: string = ''
  public longitude?: number | null = null
  public latitude?: number | null = null
  public isDelete?: number | null = null
  public synOpenid?: string = ''
  public staffId?: string = ''
  public tenantId?: string = ''
  public mainTeamId?: string = ''
  // 未完成工单量
  public unfinishedTask?: number | null = null
  public todayFinishedTask?: number | null = null
  public state?: string = ''
  public cusDistance?: number | null = null
  public superAdmin?: number | null = null
  public isTeamLeader?: number | null = null
  
  public static Enable?: number = 1;
  public static Disable?: number = 0;
  public static FirstLogin?: number = 0;
  public static NotFirstLogin?: number = 1;
  public static SuperAdmin?: number = 1;
  public static NotSuperAdmin?: number = 1;
  
  // 以下是用于前端的
  // 标签
  public label?: string = ''
  // 值
  public value?: string = ''
  // 手动自己选择的
  public selfSelected?: boolean = false
}

export default LoginUser;