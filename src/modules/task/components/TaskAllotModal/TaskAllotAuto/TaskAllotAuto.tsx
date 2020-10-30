/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* vue */
import { Vue, Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'

@Component({ 
  name: ComponentNameEnum.TaskAllotAuto 
})
export default class TaskAllotAuto extends Vue {
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotAuto}>
        
      </div>
    )
  }
  
}

