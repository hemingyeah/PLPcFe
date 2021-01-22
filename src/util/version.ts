import { getRootWindow } from '@src/util/dom'

function getRootWindowEditionData(): number {
  const RootWindow: any = getRootWindow(window)
  let edition: number = 1
  
  try {
    edition = RootWindow.shbEdition || 1
  } catch (error) {
    edition = 1
    console.warn('Caused: getRootWindowEditionData -> error', error)
  }
  
  return edition
}


function commonJudgeShow(): boolean {
  // 标准版
  if (isStandardEdition()) return false
  
  // 企业版
  if (isEnterpriseEdition()) return true
  
  // 老版本vip版
  if(isOldVipEdition()) return true
  
  // 体验版
  if (isExperienceEdition()) return false
  
  return false
}

// 是否为老版本vip版
export function isOldVipEdition(): boolean {
  return getRootWindowEditionData() === 1
}

// 是否为标准版
export function isStandardEdition(): boolean {
  return getRootWindowEditionData() === 2
}

// 是否为企业版
export function isEnterpriseEdition(): boolean {
  return getRootWindowEditionData() === 3
}

// 是否为体验版
export function isExperienceEdition(): boolean {
  return getRootWindowEditionData() === 4
}

/** 
 * 是否显示可以创建子团队
 * 1. 老版本vip版 根据 initData里面的 showNewTeam 判断
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowCreateChildrenTeam(initData: any): boolean {
  // 标准版
  if (isStandardEdition()) return false
  
  // 企业版
  if (isEnterpriseEdition()) return true
  
  // 体验版
  if (isExperienceEdition()) return false
  
  // 老版本vip版
  return Boolean(isOldVipEdition() && initData?.showNewTeam === true)
}

/** 
 * 是否显示 备件调拨
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowPartTransfer(): boolean {
  return commonJudgeShow()
}

/** 
 * 是否显示 备件申领
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowPartApply(): boolean {
  return commonJudgeShow()
}

/** 
 * 是否显示 备件退回
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowPartBack(): boolean {  
  return commonJudgeShow()
}

/** 
 * 是否显示 客户批量提醒 (都支持)
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowCustomerRemind(): boolean {
  return true
}

/** 
 * 是否显示 数据大屏
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowDashboardScreen(): boolean {
  return commonJudgeShow()
}

/** 
 * 是否显示 计划任务
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowPlanTask(): boolean {
  return commonJudgeShow()
}

/** 
 * 是否显示 服务报告
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
*/
export function isShowReport(): boolean {
  return commonJudgeShow()
}

/**
 * @description 是否显示 自助门户
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
 * @return {Boolean} 是否支持开启显示
 */
export function isShowSelfServicePortal(): boolean {
  return true
}

/**
 * @description 是否显示 自助门户
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
 * @return {Boolean} 是否支持开启显示
 */
export function isShowLinkC(): boolean {
  return commonJudgeShow()
}

/**
 * @description 是否显示 多备件库
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
 * @return {Boolean} 是否支持开启显示
 */
export function isShowMoreSperaParts(): boolean {
  return commonJudgeShow()
}

/**
 * @description 是否显示 工时记录
 * 1. 老版本vip版 支持
 * 2. 标准版 不支持
 * 3. 企业版 原生支持
 * @return {Boolean} 是否支持开启显示
 */
export function isShowCardWorkTime(): boolean {
  return commonJudgeShow()
}