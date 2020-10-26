/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
import Tag from '@model/entity/Tag/Tag'
/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/TaskAllotUserTable/TaskAllotUserTable.scss'
/* util */
import { findComponentUpward } from '@src/util/assist'

/* 用户状态 */
interface UserState {
  key: string,
  value: string,
  label: string,
  color: string,
}

type ElSelectOption = {[x: string]: string}

@Component({ name: 'task-allot-user-table' })
export default class TaskAllotUserTable extends Vue {
  
  /* 当前选择的团队 */
  private selectTeams: Tag[] = []
  /* 当前选择的团队人员列表 */
  private selectTeamUsers: LoginUser[] = []
  /* 当前选择的距离 */
  private selectLocation: any = '5'
  /* 距离选项列表 */
  private locationOptions: ElSelectOption[] = [
    { label: '5公里以内', value: '5'},
    { label: '10公里以内', value: '10'},
    { label: '20公里以内', value: '20'},
    { label: '50公里以内', value: '50'},
    { label: '其他', value: ''},
  ]
  
  /* 工单派单组件 */
  get TaskAllotModalComponent() {
    return findComponentUpward(this, 'task-allot-modal') || {}
  }
  
  /* 是否是按团队派单 */
  get isAllotByTag() {
    return this.TaskAllotModalComponent.isAllotByTag === true
  }
  
  /* 用户状态 对象 */
  get userStateMap() {
    return this.TaskAllotModalComponent.userStateMap || {}
  }
  
  /* 用户状态 列表 */
  get userStateList(): UserState[] {
    let list: UserState[] = []
    
    for (let userStateKey of this.userStateMap) {
      let userState: UserState = {
        key: userStateKey,
        value: userStateKey,
        label: userStateKey,
        color: this.userStateMap[userStateKey]
      }
      list.push(userState)
    }
    
    return list
  }
  
  private fetchTeamUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve({})
    })
  }
  
  /**
   * @description 选择团队变化事件
  */
  private handlerTeamChange(): void {
  
  }
  
  /**
   * @description 选择团队成员变化事件
  */
  private handlerTeamUsersChange(): void {
  
  }

  /**
   * @description 选择距离变化事件
  */
  private handlerLocationChange(): void {
  
  }
  
  /** 
   * @description 渲染 按团队选人
  */
  private renderChooseUserByTeam() {
    const scopedSlots = {
      option: (props: any) => {
        return (
          <div>
            {props.option.name}
          </div>
        );
    },
    }
    return (
      <biz-form-remote-select
        placeholder='请选择工单负责人'
        remoteMethod={this.fetchTeamUser}
        value={this.selectTeamUsers}
        onInput={this.handlerTeamUsersChange}
        scopedSlots={scopedSlots}
      >
      </biz-form-remote-select>
    )
  }
  
  /** 
   * @description 渲染 按部门选人
  */
  private renderChooseUserByDepartment() {
    
  }

  /**
   * @description 渲染选择团队
  */
  private renderTeamSelect() {
    return (
      <biz-team-select value={this.selectTeams} onInput={this.handlerTeamChange} multiple />
    )
  }
  
  /** 
   * @description 渲染选择位置
  */
  private renderLocationSelect() {
    return (
      <el-select
        value={this.selectLocation}
        placeholder="请选择距离"
        onInput={this.handlerLocationChange}
      >
        {
          this.locationOptions.map((locationOption: ElSelectOption) => {
            return (
              <el-option key={locationOption.value} value={locationOption.value} label={locationOption.label} />
            )
          })
        }
      </el-select>
    )
  }
  
  render(h: CreateElement) {
    return (
      <div class='task-allot-user-table'>
        <div class='task-allot-user-filter'>
          {this.isAllotByTag &&  this.renderTeamSelect()}
          {this.isAllotByTag &&  this.renderChooseUserByTeam()}
          {!this.isAllotByTag &&  this.renderChooseUserByDepartment()}
          {this.renderLocationSelect()}
        </div>
      </div>
    )
  }
  
}

