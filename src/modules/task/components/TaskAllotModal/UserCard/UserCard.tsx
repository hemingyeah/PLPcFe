/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* vue */
import { Vue, Component, Prop, Emit, Watch } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.scss'

interface TaskAllotUser extends LoginUser {
  // 未完成工单量
  unFinishedTaskCount: number,
  // 已完成工单量
  finishTaskCount: number
}

@Component({ name: 'user-card' })
export default class UserCard extends Vue {
  // 用户id
  @Prop() userId: string | undefined
  
  // 用户信息
  private user: TaskAllotUser | undefined

  @Watch('userId')
  onUserIdChanged(newVal: string, oldVal: string) {
    this.fetchUserTaskData()
  }
  
  /** 
   * @description 获取人员工单信息
  */
  private fetchUserTaskData() {
    this.user = {
      unFinishedTaskCount: 1,
      finishTaskCount: 2
    }
  }
  
  render(h: CreateElement) {    
    return (
      <div class='user-card'>
          <div class='user-card-header'>
            <div class='user-card-header-head'>
              <img src={this.user?.head || DefaultHead} />
            </div>
          </div>
      </div>
    )
  }

}


