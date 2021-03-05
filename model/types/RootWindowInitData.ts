import LoginUser from '@model/entity/LoginUser/LoginUser'

interface DDConfig {
  // 时间戳
  timeStamp: number,
  // 代理id
  agentId: number,
  // 企业id
  corpId: string,
  // 签名信息
  signature: string,
  // 签名随机字符串
  nonceStr: string
}

interface Menu {
  parent: string | null,
  menuKey: string | null,
  menuIcon: string | null,
  name: string | null,
  url: string | null,
  order: number | null
}

type RootWindowInitData = {
  // 用于跳转指定单个页面的地址
  pcUrl?: string | null,
  // 发布更新版本号
  releaseVersion?: string,
  // 灰度设置是否开启
  restructSetting?: boolean,
  confirmSetting?: boolean
  // 钉钉配置
  ddConfig?: DDConfig,
  // 环境变量
  env?: string,
  // 销售管理二维码
  saleManagerQRCode?: string,
  // 服务群地址
  serviceGroupUrl?: string,
  // 用户是否开启工单灰度
  isUserTaskGrayFunction?: boolean,
  // 工单是否开启灰度
  isTaskGrayFunction?: boolean
  // 用户工作状态对象
  userStateMap?: Record<string, string>,
  // 新用户向导
  userGuide?: boolean,
  // 是否开启超级二维码
  openSuperCode?: boolean
  // 导航菜单
  menus?: Menu[],
  // 用户数量
  userGuideNum?: number,
  // 用户数据
  user?: LoginUser
}

export default RootWindowInitData