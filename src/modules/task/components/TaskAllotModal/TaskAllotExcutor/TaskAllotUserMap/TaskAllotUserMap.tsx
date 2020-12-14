/* enum */
import ComponentNameEnum from '@model/enum/ComponentNameEnum'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserMap/TaskAllotUserMap.scss'
/* vue */
import { Component } from 'vue-property-decorator'
import { CreateElement } from 'vue'
import TaskAllotUserTableRender from '@src/modules/task/components/TaskAllotModal/TaskAllotExcutor/TaskAllotUserTable/TaskAllotUserTableRender.tsx'

@Component({ 
  name: ComponentNameEnum.TaskAllotUserMap
})
export default class TaskAllotUserMap extends TaskAllotUserTableRender {
  
  mounted() {
    
  }
  
  render(h: CreateElement) {
    return (
      <div class={ComponentNameEnum.TaskAllotUserMap}>
        
      </div>
    )
  }
}

