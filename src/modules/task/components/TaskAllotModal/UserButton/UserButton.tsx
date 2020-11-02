/* entity */
import LoginUser from '@model/entity/LoginUser/LoginUser'
/* image */
// @ts-ignore
import DefaultHead from '@src/assets/img/avatar.png'
/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserButton/UserButton.scss'

@Component({ name: 'user-button' })
export default class UserButton extends Vue {
  /* 用户删除方法 */
  @Prop() userDeleteFunc: Function | undefined
  /* 用户信息 */
  @Prop() user: LoginUser | undefined
  
  /* 默认用户头像 */
  private defaultHead: any = DefaultHead
  
  @Emit('click')
  private handlerClick(): void { }
  
  @Emit('delete')
  private deleteUser(): LoginUser | undefined {
    this.userDeleteFunc && this.userDeleteFunc(this.user)
    
    return this.user
  }
  
  render(h: CreateElement) {
    const IsHaveUser = this.user?.userId
    
    // 没有用户信息
    if (!IsHaveUser) {
      return (
        <div class='user-add-button' onClick={this.handlerClick}>
          <i class='iconfont icon-add'></i>
        </div>
      )
    }
    
    let { head = '', displayName = '' } = this.user || {}
    
    return (
      <div class='user-button'>
        <img class='user-button-head' src={head || this.defaultHead} />
        <i class='iconfont icon-circle-delete user-button-delete' onClick={this.deleteUser}></i>
        <el-tooltip content={displayName} placement='top'>
          <div class='user-button-name'>{displayName}</div>
        </el-tooltip>
      </div>
    )
  }
  
}

