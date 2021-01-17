/* enum */
import EventNameEnum from '@model/enum/EventNameEnum'
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* mixin */
import FormMixin from '@src/component/form/mixin/form'
/* model */
import ElSelectOption from '@model/types/ElSelectOption'
import Page from '@model/Page'
/* vue */
import VC from '@model/VC'
import { VNode } from 'vue'
import { CreateElement } from 'vue'
import { Component, Emit, Prop } from 'vue-property-decorator'
/* scss */
import '@src/component/business/BizRemoteSelect/BizRemoteSelect.scss'
/* util */
import Log from '@src/util/log.ts'
import { uuid } from '@src/util/string'
import { isUndefined } from '@src/util/type'

interface LoadmoreOptions {
  // 是否禁用
  disabled: boolean,
  // 回调函数
  callback: Function,
  // 触发距离
  distance: number,
}

@Component({
  name: ComponentNameEnum.BizRemoteSelect,
  mixins: [FormMixin]
})
class BizRemoteSelect extends VC<{}> {
  
  /* 收缩状态 */
  @Prop({ default: false }) readonly collapsed: boolean | undefined
  /* 清除状态 */
  @Prop({ default: false }) readonly cleared: boolean | undefined
  /* 禁用状态 (与混入FormMixin的computed中disabled做区分) */
  @Prop({ default: false }) readonly inputDisabled: boolean | undefined
  /* 多选 */
  @Prop({ default: false }) readonly multiple: boolean | undefined
  /* 配置项列表 */
  @Prop() readonly options: any[] | undefined
  /* 占位符 */
  @Prop() readonly placeholder: string | undefined
  /* 远程搜索方法 */
  @Prop() readonly remoteMethod: Function | undefined
  /* 值 */
  @Prop() readonly value: Array<any> | undefined
  /* select数据值的键名 */
  @Prop({ default: 'value' }) readonly valueKey: string | undefined
  
  private loadmoreOptions: LoadmoreOptions = {
    disabled: false,
    callback: this.loadmore,
    distance: 10,
  }
  /* 等待状态 */
  private pending: boolean = false
  /* 页面对象 */
  private page: Page = new Page()
  /* 聚焦次数 */
  private focusedNum: number = 0
  
  @Emit(EventNameEnum.Clear)
  private clearHandler() {
    return []
  }
  
  @Emit(EventNameEnum.Input)
  private inputHandler(value: any[] | string): Array<any> {
    let data: any[] = []
    // 多选
    if (this.isMulti) {
      data = value.slice() as Array<any>
    } else {
      data = this.optionList.filter((item: any) => item?.id === value || item?.value === value)
    }
    
    return data
  }
  
  @Emit('searchEnd')
  private emitSearchEndHandler() {}
  
  get isMulti(): boolean {
    return !isUndefined(this.multiple) && this.multiple !== false
  }
  
  get optionList() {
    if (this.options?.length) return this.options
    
    return this.page.list
  }
  
  get selectValue(): any[] {
    // 多选
    if (this.isMulti) {
      return this.value || []
    }
    // 单选
    let data = this.value?.[0] || {}
    let value = data.id || data.value
    
    return value
  }
  
  /**
   * @description: 是否显示清除按钮
   * @return {Boolean} 是否显示
  */
  get showClearButton(): boolean {
    return Boolean(this.cleared && this.value && this.value?.length > 0 && !this.inputDisabled)
  }
  
  private focusHandler() {
    this.search()
  }
  
  /**
   * @description: 获取远程数据
   * @param {string} keyword 搜索关键字
   * @return {Promise<Page>}
  */  
  private fetchRemoteData(keyword: string = '') {    
    if (!this.remoteMethod) return null
    
    // 页面信息
    const { pageNum, pageSize } = this.page
    const params = { keyword, pageNum, pageSize }
    
    return (
      this.remoteMethod(params)
        .then((result: Page) => {
          this.pending = false
          this.loadmoreOptions.disabled = Boolean(!result?.hasNextPage)
          return result
        })
        .catch((error: any) => {
          this.pending = false
          Log.error(error, this.search.name)
        })
    )
  }
  
  /**
   * @description: 加载更多
  */  
  private async loadmore() {
    if (this.pending || this.loadmoreOptions.disabled) return
    
    this.loadmoreOptions.disabled = true
    this.pending = true
    
    try {
      this.page.pageNum += 1
      const result = await this.fetchRemoteData()
      this.page.merge(result)
    } catch (error) {
      Log.error(error, this.loadmore.name)
    }
  }
  
  /**
   * @description: 搜索
   * @param {string} keyword 搜索关键字
   * @return {void}
  */  
  private search(keyword: string = '') {
    if (!this.remoteMethod) return null
    if (this.pending) return null
    
    // 初始化page对象
    this.page = new Page()
    // 获取远程数据
    this.fetchRemoteData(keyword).then((data: Page) => {
      this.page.cover(data)
    })
  }
  
  /**
   * @deprecated -- 已废弃 
   * @description: 渲染清除按钮
   * @return {VNode | null}
  */
  private renderClearButton(): VNode | null {
    if (!this.showClearButton) return null
    
    return (
      <div class="biz-form-remote-select-clear" onClick={() => this.clearHandler()}>
        <i class="el-icon-error" style="color:rgba(211, 214, 217, 0.69);"></i>
      </div>
    )
  }
  
  /**
   * @description: 渲染列表
   * @return {VNode}
  */
  private renderOptionList(): VNode {
    const className = 'biz-remote-select-option'
    return (
      this.optionList.map((option: ElSelectOption) => {
        return (
          <el-option class={className} key={uuid()} label={option.label} value={option.value}>
            { this.$scopedSlots.option && this.$scopedSlots.option({ option }) }
          </el-option>
        )
      })
    )
  }
  
  render(h: CreateElement) {
    return (
      <div class='biz-form-remote-select'>
        <el-select
          v-el-select-loadmore={this.loadmoreOptions}
          clearable={this.showClearButton}
          collapsed={this.collapsed}
          disabled={this.inputDisabled}
          multiple={this.isMulti}
          filterable
          no-data-text='无匹配数据'
          remote
          reserve-keyword
          remoteMethod={this.search}
          placeholder={this.placeholder}
          scopedSlots={this.$scopedSlots}
          value={this.selectValue}
          onInput={this.inputHandler}
          onFocus={this.focusHandler}
        >
          {this.renderOptionList()}
        </el-select>
      </div>
    )
  }
}

export default BizRemoteSelect