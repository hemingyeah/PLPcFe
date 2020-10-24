/* vue */
import { Vue, Component, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import '@src/modules/task/components/TaskAllotModal/UserAddButton/UserAddButton.scss'

@Component({ name: 'user-add-button' })
export default class UserAddButton extends Vue {

  /* 用户信息 */
  @Prop() user: any | undefined

  /** 添加按钮 */ 
  
  private addButton() {

  }

  private userHead() {
    
  }
  
  render(h: CreateElement) {
    return (
      <div class='user-add-button'>
        <i class='iconfont icon-add'></i>
      </div>
    )
  }
  
}

