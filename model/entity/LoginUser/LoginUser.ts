import Tag from '@model/entity/Tag/Tag'
import Role from '@model/entity/Role/Role'
import Department from '@model/entity/Department/Department'

class LoginUser {
  public static serialVersionUID?: any
  public userId: String = ''
  // 登录用户名
  public loginName?: String = ''
  public loginPassword?: String = ''
  // 登录密码
  public salt?: String = ''
  // 姓名
  public displayName?: String = ''
  // 邮箱
  public email?: String = ''
  // 手机号
  public cellPhone?: String = ''
  // 上次登录时间
  public lastLoginTime?: String = ''
  // 启用状态
  public enabled?: Number | null = null
  // 微信id
  public weixinid?: String = ''
  public powercode?: String = ''
  public head?: String = ''
  public sex?: String = ''
  // 是否为第一次登录标记
  public firstLogin?: Number | null = null
  // 用户的所有标签
  public tagList?: Tag[] = []
  public departments?: Department[] = []
  public roles?: Role[] = []
  public attribute?: any = {}
  public openid?: String = ''
  public longitude?: Number | null = null
  public latitude?: Number | null = null
  public isDelete?: Number | null = null
  public synOpenid?: String = ''
  public staffId?: String = ''
  public tenantId?: String = ''
  public mainTeamId?: String = ''
  public unfinishedTask?: Number | null = null
  public todayFinishedTask?: Number | null = null
  public state?: String = ''
  public cusDistance?: Number | null = null
  public superAdmin?: Number | null = null
  public isTeamLeader?: Number | null = null

  public static Enable?: Number = 1;
  public static Disable?: Number= 0;
  public static FirstLogin?: Number = 0;
  public static NotFirstLogin?: Number = 1;
  public static SuperAdmin?: Number = 1;
  public static NotSuperAdmin?: Number= 1;
}

export default LoginUser;