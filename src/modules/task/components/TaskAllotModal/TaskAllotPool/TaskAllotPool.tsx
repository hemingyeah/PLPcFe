/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* vue */
import { Vue, Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'

@Component({ 
  name: ComponentNameEnum.TaskAllotExcutor 
})
export default class TaskAllotPool extends Vue {
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotPool}>
        
      </div>
    )
  }
  
}

