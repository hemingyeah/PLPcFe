import EsBalance from '@model/entity/EsBalance'
import EsLocation from '@model/entity/EsLocation'
import EsTaskAddress from '@model/entity/EsTaskAddress'
import EsTaskCustomer from '@model/entity/EsTaskCustomer'
import EsTaskEvaluate from '@model/entity/EsTaskEvaluate'
import EsTaskLinkMan from '@model/entity/EsTaskLinkMan'
import EsTaskLoginUser from '@model/entity/EsTaskLoginUser'
import EsTaskProduct from '@model/entity/EsTaskProduct'

/**
 * @author hbc
 * PC端工单列表返回数据实体
 * 拷贝的后端的。没有注释别找我
*/
class EsTask {
  public pcLikeSearch?: string | null = null
  
  //包含自动义字段支持模糊搜索
  public attributeLikeSearch?: string | null = null
  
  public moLikeSearch?: string | null = null
  
  //工单附加组件模糊搜索字段
  public cardLikeSearch?: string | null = null
  
  //工单备注模糊搜索字段
  public taskRemarksLikeSearch?: string | null = null
  
  public id: string = ''
  public iid?: number | null = null
  
  public taskUUID?: string | null = null
  public tenantId?: string | null = null
  public taskNo?: string | null = null
  
  public customerEntity?: EsTaskCustomer | null = null
  
  public level?: string | null = null
  public serviceType?: string | null = null
  public serviceContent?: string | null = null
  public description?: string | null = null
  public state?: string | null = null
  public stateEnum?: number | null = null
  public createTime?: Date | null = null
  
  public executorUser?: EsTaskLoginUser | null = null
  
  // Map<String, Object>
  public attribute?: any = {}
  
  // 审核结算的自定义字段,在Es中用balanceAttributeStr存String格式,取出后转回
  // Map<String, Object>
  public balanceAttribute?: any = {}
  public balanceAttributeStr?: string | null = null
  
  public createUser?: EsTaskLoginUser | null = null
  // List<Map<String,Object>>
  public attachment?: any[] = []
  public planTime?: Date | string | null = null
  public isReview?: number | null = null
  public degree?: string | null = null
  public suggestion?: string | null = null
  public balanceConfirm?: number | null = null
  public balanceTime?: Date | null = null
  public balanceUser?: EsTaskLoginUser | null = null
  public receiptContent?: string | null = null
  public product?: EsTaskProduct | null = null
  public completeTime?: Date | null = null
  public synergies?: EsTaskLoginUser[] = []
  public startOn?: number | null = null
  public startTime?: Date | null = null
  public autograph?: string | null = null
  public reviewUser?: EsTaskLoginUser | null = null
  public reviewTime?: Date | null = null
  public allotTime?: Date | null = null
  public allotUser?: EsTaskLoginUser | null = null
  public acceptTime?: Date | null = null
  public closeTime?: Date | null = null
  public address?: EsTaskAddress | null = null
  public linkMan?: EsTaskLinkMan | null = null
  public version?: string | null = null
  public inTaskPool?: number | null = null
  public updateTime?: Date | null = null
  public updateContent?: string | null = null
  public products?: EsTaskProduct[] = []
  public evaluateSource?: string | null = null
  public templateId?: string | null = null
  public templateName?: string | null = null
  
  // 附加组件信息，json格式, 但是在ES中使用字符串的方式储存的,因为里面包含自定义字段,取出后转为对象存入用cardInfoStr字段
  // List<Map>
  public cardInfo?: any[] = []
  public cardInfoStr?: string | null = null
  
  public inApprove?: number | null = null
  public isPaused?: number | null = null
  public overTime?: Date | null = null
  /**
   * 下面使用时间 后端是number类型，加 string类型是前端用来显示的
  */
  public taskUsedTime?: number | string | null = null
  public acceptUsedTime?: number | string | null = null
  public workUsedTime?: number | string | null = null
  /**
   * 2019/02/15 9?:48 添加响应用时字段
   * author liChai
  */
  public taskResponseTime?: number | string | null = null
  public onceOverTime?: number | null = null
  public evaluateContent?: string | null = null
  public sparePart?: string | null = null
  public isDelete?: number | null = null
  public settlement?: number | null = null
  public onceRefused?: number | null = null
  public oncePaused?: number | null = null
  public allotType?: number | null = null
  public onceReallot?: number | null = null
  public positionException?: number | null = null
  
  public oncePrinted?: number | null = null
  /**
   * 是否回退过，1未曾经回退过，0为从未回退过
  */
  public onceRollback?: number | null = null
  public guide_professions?: string[] = []
  public isGuideData?: boolean = false
  //结算标记，默认-1，0未结算，1已结算
  public isSettled?: number | null = null
  public distance?: number | null = null
  public isReviewed?: number | null = null
  public isEvaluated?: number | null = null
  public balanceEntity?: EsBalance | null = null
  public locationEntity?: EsLocation | null = null
  public isClosed?: number | null = null
  //是否有查看客户的权限
  public linkAuth?: boolean | null = null
  public esTaskEvaluateEntity?: EsTaskEvaluate | null = null
  
  /* 下面是前端专属的 不属于后端 */
  public latesetUpdateRecord?: string | null = null
}

export default EsTask