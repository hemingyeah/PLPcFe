/* vue */
import Component from 'vue-class-component'
import { Ref, Vue } from 'vue-property-decorator'
/* components */
import { Table } from 'element-ui'

@Component({ 
  components: {
    
  }
})

class TaskAllotUserTableComponents extends Vue {
  /* 工单指派人员表格组件 */
  @Ref() TaskAllotUserElTableComponent !: Table
}

export default TaskAllotUserTableComponents