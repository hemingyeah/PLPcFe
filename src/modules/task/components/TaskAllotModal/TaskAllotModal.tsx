/* vue */
import Component from 'vue-class-component'
import { Vue, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* components */
import TaskAllotType from '@src/modules/task/components/TaskAllotModal/TaskAllotType.tsx'
import TaskAllotUserTable from '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTable.tsx'
import UserButton from '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.tsx'
/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* enum */
import TaskAllotTypeEnum from '@model/enum/TaskAllotTypeEnum'
/* scss */
import './TaskAllotModal.scss'

interface User {
  displayName: string
  head?: string
  staffId?: string
  userId: string
}
/* 部门多选选人返回结果 */
type DepeMultiUserResult = { status: number, data: { users: User[] } }

@Component({
  name: 'task-allot-modal',
  components: {
    [TaskAllotType.name]: TaskAllotType,
    [TaskAllotUserTable.name]: TaskAllotUserTable,
    [UserButton.name]: UserButton
  }
})

export default class TaskAllotModal extends Vue {
  
  /* 用户状态 */
  @Prop() userStateMap: any | undefined
  
  /* 派单方式 */
  private allotType: TaskAllotTypeEnum = TaskAllotTypeEnum.Person
  /* 是否是按团队派单 */
  private isAllotByTag: boolean = true
  /* 是否显示派单弹窗 */
  private showTaskAllotModal: boolean = false
  /* 协同人列表 */
  private synergyUserList: LoginUser[] = []
  
  /** 
   * @description 选择协同人
  */
  private chooseSynergyUser(): void {
    let options = {
      title: '请选择协同人',
      seeAllOrg: true,
      selected: this.synergyUserList,
      max: 14
    }

    // @ts-ignore
    this.$fast.contact.choose('dept', options)
      .then((result: DepeMultiUserResult) => {
        let isSuccess = result.status == 0
        if (!isSuccess) return
        
        // 协同人赋值
        this.synergyUserList = result?.data?.users || []
      })
      .catch((err: any) => {
        console.error(err)
      })
  }
  
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
  
  /** 
   * @description 渲染协同人
  */
  private renderSynergy() {
    // 协同人列表是否是空的
    let isSynergyListEmpty = this.synergyUserList.length <= 0
    
    return (
      <div class='task-allot-synergy'>
        <span class='task-allot-nav-title'>选择工单协同人</span>
        <div class='task-allot-synergy-list'>
          {
            this.synergyUserList.map((synergyUser: LoginUser) => {
              return <user-button user={synergyUser} /> 
            })
          }
          <user-button onClick={this.chooseSynergyUser} /> 
        </div>
      </div>
    )
  }
  
  render(h: CreateElement) {
    const attrs = {
      class: 'task-allot-modal',
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
        <div class='task-allot-nav'>
          <div class='task-allot-type'>
            <span class='task-allot-nav-title'>派单方式</span>
            <task-allot-type type={this.allotType} onChange={this.handlerAllotTypeChange} />
          </div>
          <div class='task-allot-executor'>
            <span class='task-allot-nav-title'>负责人</span>
            <user-button />
          </div>
          {this.renderSynergy()}
        </div>
        <div class='task-allot-content'>
          <task-allot-user-table />
        </div>
      </base-modal>
    )
  }
  
}

