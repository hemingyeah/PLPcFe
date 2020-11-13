/* api */
import { getAutoDispatchResultList } from '@src/api/TaskApi'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* model */
import { TaskAutoDispatchResultListModel } from '@model/param/in/Task'
import { getAutoDispatchResultListResult } from '@model/param/out/Task'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotAuto/TaskAllotAuto.scss'
/* types */
import AutoDispatchListItem from '@model/types/AutoDispatchListItem'
/* util */
import Platform from '@src/util/Platform'
/* vue */
import { Vue, Component, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'

@Component({ 
  name: ComponentNameEnum.TaskAllotAuto 
})
export default class TaskAllotAuto extends Vue {
  /* 工单信息 */
  @Prop() readonly task: any | undefined
  
  /* 匹配结果 */
  private autoDispatchResultList: AutoDispatchListItem[] = []
  /* css类名 */
  private className: string = ComponentNameEnum.TaskAllotAuto
  /* 是否显示未匹配成功的结果 */
  private isShowUnMatchResult: boolean = false
  /* 是否使用匹配出的预估结果 */
  private isUsedResult: boolean = false
  /* 匹配的规则 */
  private matchRole: AutoDispatchListItem | null = null
  /* 匹配成功的索引 */
  private matchRoleIndex: number = -1
  /* 等待状态 */
  private pending: boolean = false
  
  /* 自动派单根据是否显示未匹配的筛选列表 匹配结果用于显示的列表 */
  get autoDispatchResultFilterList(): AutoDispatchListItem[] {
    // 显示全部结果
    if (this.isShowUnMatchResult) {
      return this.autoDispatchResultList.slice()
    }
    
    let matchResultBeforeList: AutoDispatchListItem[]  = []
    let item: AutoDispatchListItem | null = null
    let matchSuccessfully = false
    // 遍历过滤结果
    for (let i = 0; i < this.autoDispatchResultList.length; i++) {
      item = this.autoDispatchResultList[i]
      // 根据规则id判断是否匹配成功
      matchSuccessfully = this.isMatchSuccessfully(item)
      matchResultBeforeList.push(item)
      // 匹配成功
      if (matchSuccessfully) {
        this.matchRole = item
        this.matchRoleIndex = i
        break
      }
    }
    
    return matchResultBeforeList
  }
  
  /* 匹配结果为空 */
  get isMatchResultEmpty() {
    return this.autoDispatchResultList.length <= 0
  }
  
  /* 构建参数 */
  private buildParams() {
    return {
      taskId: this.task?.id || '',
      executorId: 'auto_dispatch'
    }
  }
  
  /** 
   * @description 获取自动派单预估列表结果
  */
  private fetchAutoDispatchResultList() {
    if (this.pending) return
    
    this.pending = true
    this.isUsedResult = false
    let params: TaskAutoDispatchResultListModel = this.buildParams()
    
    getAutoDispatchResultList(params)
      .then((data: getAutoDispatchResultListResult) => {
        let isSuccess = data.success
        
        if (isSuccess) {
          this.autoDispatchResultList = data.result || []
        } else {
          Platform.alert(data.message)
        }
        
      })
      .catch((err: any) => {
        console.log(err)
      })
      .finally(() => {
        this.pending = false
      })
  }
  
  /** 
   * @description 判断是否验证成功
  */
  private isMatchSuccessfully = (item: AutoDispatchListItem): boolean => {
    // 根据规则id判断是否匹配成功
    return Boolean(item.finalRuleId)
  }
  
  /** 
   * @description 渲染自动匹配内容
  */
  private renderAutoMatch(h: CreateElement, item: AutoDispatchListItem, index: number) {
    let matchSuccessfully = this.isMatchSuccessfully(item)
    // 渲染未匹配成功dom
    if (!matchSuccessfully) {
      return this.renderUnMathItem(item)
    }
    
    
    return this.renderMathItem(item)
  }
  
  /** 
   * @description 渲染类名
  */
  private renderClassName(h: CreateElement, item: AutoDispatchListItem, index: number): string[] {
    let isBefore = index < this.matchRoleIndex
    return isBefore ? ['base-timeline-item-before'] : []
  }
  
  /** 
   * @description 渲染自动匹配头部
  */
  private renderHead(h: CreateElement, item: AutoDispatchListItem, index: number) {
    let matchSuccessfully = this.isMatchSuccessfully(item)
    let isBefore = index < this.matchRoleIndex
    // 渲染未匹配成功dom
    if (!matchSuccessfully) {
      let classNames = ['base-timeline-head', 'base-timeline-head-no-match']
      isBefore && classNames.push('base-timeline-head-before')
      
      return <div class={classNames}>{index + 1}</div>
    }
    
    return (
      <div class='base-timeline-head base-timeline-head-match'>
        <i class='iconfont icon-duihao'></i>
      </div>
    )
  }
  
  /** 
   * @description 渲染匹配的节点
  */
  private renderMathItem(item: AutoDispatchListItem) {
    return (
      <div class={`${this.className}-item`}>
        <div class={[`${this.className}-item-name`, `${this.className}-match`]}>按「{item.finalRuleName || ''}」匹配</div>
        <div>
          { item.finalExecutorName && <span>预估匹配到合适人员【{item.finalExecutorName}】</span> }
          { item.candidateOneName && <span>, 当前备选人员 {item.candidateOneName}, {item.candidateTwoName}</span> }
        </div>
        <div>
          提交后，系统会按分配规则重新匹配，可能会出现与预估的负责人不一致的情况。您可以
          <el-checkbox value={this.isUsedResult} onInput={(value: boolean) => this.isUsedResult = value}>
            使用预估结果
          </el-checkbox>
        </div>
      </div>
    )
  }
  
  /** 
   * @description 渲染未匹配的节点
  */
  private renderUnMathItem(item: AutoDispatchListItem) {
    return (
      <div class={`${this.className}-item`}>
        <div class={`${this.className}-item-name`}>按「{item.name || ''}」匹配</div>
        <div class={`${this.className}-nomatch`}>未匹配到合适人员</div>
      </div>
    )
  }
  
  mounted() {
    this.fetchAutoDispatchResultList()
  }
  
  render(h: CreateElement) {
    return (
      <div class={this.className}>
        <div class={`${this.className}-header`}>
          <el-button type='primary' onClick={this.fetchAutoDispatchResultList}>重新匹配</el-button>
          <el-button type='ghost'>添加新规则</el-button>
        </div>
        <div class={`${this.className}-content`}>
          <base-timeline 
            data={this.autoDispatchResultFilterList} 
            loading={this.pending} 
            classNameRender={this.renderClassName}
            headRender={this.renderHead}
            recordRender={this.renderAutoMatch}
          />
        { this.isMatchResultEmpty && <div>暂无匹配结果</div> }
          <el-button onClick={() => this.isShowUnMatchResult = !this.isShowUnMatchResult}>
            { this.isShowUnMatchResult ? '收起' : '查看更多' }
          </el-button>
        </div>
      </div>
    )
  }
  
}

