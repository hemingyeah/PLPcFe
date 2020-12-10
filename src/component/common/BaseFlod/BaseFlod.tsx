/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'

@Component({ 
  name: ComponentNameEnum.BaseFlod
})

export default class BaseFlod extends Vue {
  
  /* 默认渲染 */
  private slotDefault: any = null
  
  mounted() {
    this.slotDefault = this.$scopedSlots.default
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.BaseFlod}>
        {this.slotDefault && this.slotDefault()}
      </div>
    )
  }
  
}

