/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'

@Component({ 
  name: ComponentNameEnum.BaseFlodItem
})

export default class BaseFlodItem extends Vue {
  /* 标题 */
  @Prop() readonly title: string | undefined
  
  /* css类名 */
  private className: string = ComponentNameEnum.BaseFlodItem
  /* 默认渲染 */
  private slotDefault: any = null
  /* 标题渲染 */
  private slotTitle: any = null
  
  mounted() {
    this.slotDefault = this.$scopedSlots.default
    this.slotTitle = this.$scopedSlots.title
  }
  
  /** 
   * @description 渲染标题
  */
  private renderTitle() {
    
    return (
      <div class={`${this.className}-title`}>
        {
          this.slotTitle 
            ? this.slotTitle()
            : <div>{this.title}</div>
        }
      </div>
    )
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.BaseFlodItem}>
        {this.renderTitle()}
        <el-collapse-transition>
          <div class={`${this.className}-content`}>
            {this.slotDefault && this.slotDefault()}
          </div>
        </el-collapse-transition>
      </div>
    )
  }
  
}

