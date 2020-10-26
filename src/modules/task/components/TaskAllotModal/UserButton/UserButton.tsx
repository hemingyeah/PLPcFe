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

  /* 用户信息 */
  @Prop() user: LoginUser | undefined
  
  /* 默认用户头像 */
  private defaultHead: any = DefaultHead
  
  @Emit('click')
  private handlerClick(): void { }
  
  private userHead() {
    
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
    
    return (
      <div class='user-button'>
        <img src={this.user?.head || this.defaultHead} />
      </div>
    )
  }
  
}

