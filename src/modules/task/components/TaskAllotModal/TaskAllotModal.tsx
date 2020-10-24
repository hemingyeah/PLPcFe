/* vue */
import Component from 'vue-class-component'
import { Vue } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* components */
import TaskAllotType from '@src/modules/task/components/TaskAllotModal/TaskAllotType.tsx'
import UserAddButton from '@src/modules/task/components/TaskAllotModal/UserAddButton/UserAddButton.tsx'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'

@Component({
  name: 'task-allot-modal',
  components: {
    [TaskAllotType.name]: TaskAllotType,
    [UserAddButton.name]: UserAddButton
  }
})

export default class TaskAllotModal extends Vue {
  
  /* 派单方式 */
  private allotType: TaskAllotTypeEnum = TaskAllotTypeEnum.Person
  /* 是否显示派单弹窗 */
  private showTaskAllotModal: boolean = false

  /** 
   * @description 派单方式变化
  */
  private handlerAllotTypeChange(type: TaskAllotTypeEnum) {
    this.allotType = type
  }
  
  /** 
   * @description 显示弹窗
  */
  public show() {
    this.showTaskAllotModal = true
  }
  
  render(h: CreateElement) {
    const attrs = {
      props: {
        title: '派单'
      },
      on: {
        'update:show': (val: any) => {
          this.showTaskAllotModal = val
        }
      }
    }
    return (
      <base-modal show={this.showTaskAllotModal} {...attrs}>
        <div class='task-allot-type-block'>
          <span>派单方式</span>
          <task-allot-type type={this.allotType} onChange={this.handlerAllotTypeChange} />
        </div>
        <div class='task-allot-type-block'>
          <span>负责人</span>
          <user-add-button/>
        </div>
      </base-modal>
    )
  }
  
}

