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
import { isEmpty, isObject, isUndefined } from '@src/util/type'

interface LoadmoreOptions {
  // 是否禁用
  disabled: boolean,
  // 回调函数
  callback: Function,
  // 触发距离
  distance: number,
}

/* @deprecated 已弃用 */
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
  /* 关键词 */
  private keyword: string = ''
  
  @Emit(EventNameEnum.Clear)
  private clearHandler() {
    return []
  }
  
  @Emit('searchEnd')
  private emitSearchEndHandler() {}
  
  private inputHandler(value: any[] | string) {
    let data: any[] = []
    // 多选
    if (this.isMulti) {
      // 根据valuekey 返回原始数据
      let optionValue = ''
      data = this.optionList.filter((option: any) => {
        optionValue = option[this.valueKey || '']
        return value.indexOf(optionValue) >= 0
      })
      if(Array.isArray(value)){
        const notInListValues=value.filter(v=>!this.optionList.find((option:any)=>option.value===v))
        const notInList=this.value?.filter(item=>notInListValues.find(v=>item.value===v))
        data = data.concat(notInList)
      }
    } else {
      data = this.optionList.filter((item: any) => item?.id === value || item?.value === value)
    }
    
    this.$emit(EventNameEnum.Input, data)
  }
  
  get isMulti(): boolean {
    return !isUndefined(this.multiple) && this.multiple !== false
  }
  
  get optionList() {
    let isKeywordEmpty = isEmpty(this.keyword)
    let isOptionsEmpty = isEmpty(this.options)
    let isPageListEmpty = isEmpty(this.page.list)
    
    if (isOptionsEmpty && isPageListEmpty && isKeywordEmpty) return this.value || []
    if (!isOptionsEmpty) return this.options
    
    return this.page.list
  }
  
  get selectValue(): any[] {
    // 多选
    if (this.isMulti) {
      return (
        this.value?.map(item => {
          // 对象只取value
          if (isObject(item)) {
            return item[this.valueKey || '']
          }
          
          return item
          
        }).filter(item => Boolean(item)) || []
      )
    }
    // 单选
    let data = this.value?.[0] || {}
    let value = data[this.valueKey || ''] || data.id
    
    return value
  }
  
  /**
   * @description: 是否显示清除按钮
   * @return {Boolean} 是否显示
  */
  get showClearButton(): boolean {
    return Boolean(this.cleared && this.value && this.value?.length > 0 && !this.inputDisabled)
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
   * @description: 获取属性列表
   * @return {Object}
  */  
  private getAttributes() {
    return {
      directives: [
        {
          name: 'loading',
          value: this.pending
        }
      ]
    }
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
    
    this.keyword = keyword
    
    // 初始化page对象
    this.page = new Page()
    // 获取远程数据
    this.fetchRemoteData(keyword).then((data: Page) => {
      this.page.cover(data)
    })
  }
  
  /**
   * @description: 下拉框出现/隐藏时触发
   * @param {visible} 出现则为 true，隐藏则为 false
   * @return {void}
  */  
  private visibleHandler(visible: boolean) {
    if (visible) return this.search()
    
    this.page.list = []
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
    const attrs = this.getAttributes()
    
    return (
      <div class='biz-form-remote-select'>
        <el-select
          ref='BaseRemoteSelect'
          v-el-select-loadmore={this.loadmoreOptions}
          clearable={this.showClearButton}
          collapsed={this.collapsed}
          disabled={this.inputDisabled}
          loading={this.pending}
          multiple={this.isMulti}
          filterable
          no-match-text='无数据'
          no-data-text='无匹配数据'
          remote
          reserve-keyword
          remoteMethod={this.search}
          placeholder={this.placeholder}
          scopedSlots={this.$scopedSlots}
          value={this.selectValue}
          valueKey={this.valueKey}
          onInput={this.inputHandler}
          onVisible-change={this.visibleHandler}
        >
          <div class='biz-form-remote-select-option-container' {...attrs}>
            {this.renderOptionList()}
          </div>
        </el-select>
      </div>
    )
  }
}

export default BizRemoteSelect