/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import './RelationOptionsModal.scss'
/* util */
import Platform from '@src/util/Platform'
import { TaskFieldNameMappingEnum } from '@model/enum/FieldMappingEnum'

/* 关联项 */
class RelationItem {
  // 标题
  displayName: string = ''
  // 字段唯一标识
  fieldName: string = ''
  // 字段类型
  formType: string = ''
  // 模块
  module: string = ''
  
  constructor(field = { displayName: '', fieldName: '', formType: '' }, isCustomer: boolean) {
    this.displayName = field.displayName || ''
    this.fieldName = field.fieldName || ''
    this.formType = field.formType || ''
    this.module = isCustomer ? TaskFieldNameMappingEnum.Customer : TaskFieldNameMappingEnum.Product
  }
}

@Component({ 
  name: 'relation-options-modal'
})
export default class RelationOptionsModal extends Vue {
  /* 显示状态 */
  private show: boolean = false
  /* 是否客户关联查询 */
  private isCustomer: boolean = false
  /* 关联项列表 */
  private relationOptions: Array<any> = []
  /* 已选择的关联项 */
  private selectedRelationItem: Array<any> = []
  /* 可以关联的最大数量 */
  private selectedRelationArrayMaxLength: Number = 4

  /* 已选择的关联项数组 */
  get selectedRelationArray(): any[] {
    let selectedRelationArray: any = []

    this.selectedRelationItem.map(item => {
      let selectedItem = this.relationOptions.find(option => option.fieldName == item)
      selectedRelationArray.push(new RelationItem(selectedItem, this.isCustomer))
    })

    return selectedRelationArray
  }

  /* 禁用 */
  get isDisabled(): Boolean {
    return this.selectedRelationItem.length >= this.selectedRelationArrayMaxLength;
  }

  /**
  * @description 
  */
  private currentOption(relationOptions: []): void {
    // 初始化关联项数据
    this.relationOptions = relationOptions
    // 清空已选择的关联项
    this.selectedRelationItem = []

    this.show = true
  }

  /**
  * @description 显示
  */
  private open(relationOptions: [], isCustomer: true): void {
    // 初始化关联项数据
    this.relationOptions = relationOptions
    // 清空已选择的关联项
    this.selectedRelationItem = []

    this.isCustomer = isCustomer
    this.show = true
  }
  
  /** 
  * @description 取消
  */
  private cancel(): void {
    this.show = false
  }
  
  /** 
  * @description 确定
  */
  private confirm(): void {
    // 校验关联项必填性
    if (!this.selectedRelationItem.length) {
      Platform.alert('请选择关联项')
      return
    }
    
    this.show = false
    this.emitConfirm()
  }

  @Emit('confirm')    
  private emitConfirm() {
    return this.selectedRelationArray
  }

  /** 
  * @description 渲染关联项
  */
  private renderRelationOptions() {
    return (
      <div class='relation-options-panel'>
        <h4>全部字段</h4>
        <el-checkbox-group
          value={this.selectedRelationItem}
          onInput={(value: []) => this.selectedRelationItem = value}
        >
          {
            this.relationOptions.map((item: any) => {
              return (
                <el-checkbox
                  label={item.fieldName}
                  disabled={this.isDisabled && this.selectedRelationItem.indexOf(item.fieldName) == -1}
                >
                  { item.displayName }
                </el-checkbox>
              )
            })
          }
        </el-checkbox-group>
      </div>
    )
  }

  /** 
  * @description 渲染已选择的关联项
  */
  private renderSelectedRelationOptions() {
    return (
      <div class='relation-options-panel'>
        <h4>已选字段<span>{this.selectedRelationArray.length}/{this.selectedRelationArrayMaxLength}</span></h4>
        <div class='relation-options-selected-panel'>
          {
            this.selectedRelationArray.map((item: any) => {
              return (
                <label>{ item.displayName }</label>
              )
            })
          }
        </div>
      </div>
    )
  }

  /** 
  * @description 渲染icon
  */
 private renderIncon() {
  return (
    <div class='relation-options-icon'>
      <i class='iconfont icon-mianbanjiantou'></i>
    </div>
  )
}
  
  render(h: CreateElement) {
    const attrs = {
      class: 'related-options-modal',
      props: {
        show: this.show,
        title: '关联显示项配置',
        appendToBody: true
      },
      on: {
        'update:show': (val: boolean) => {
          this.show = val
        }
      }
    }
    
    return (
      <base-modal {...attrs}>
        {this.renderRelationOptions()}
        {this.renderIncon()}
        {this.renderSelectedRelationOptions()}
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" onClick={this.cancel}>取消</el-button>
          <el-button type="primary" onClick={this.confirm}>保存</el-button>
        </div>
      </base-modal>
    )
  }
  
}

