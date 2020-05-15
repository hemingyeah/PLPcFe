import Vue, { CreateElement } from 'vue'
import Component from 'vue-class-component';

const ComponentName = 'tsx-comp'

// @Component 修饰符注明了此类为一个 Vue 组件
@Component({
  name: ComponentName,
  // 所有的组件选项都可以放在这里
  //template: '<button @click="onClick">Click!</button>'
})
export default class Calendar extends Vue {
  // 初始数据可以直接声明为实例的属性
  message: string = 'Hello!'

  // 组件方法也可以直接声明为实例的方法
  onClick(): void {
    window.alert(this.message)
  }

  render(h: CreateElement){
    return (<div>hello first tsx component</div>);
  }

  //用于注册组件
  static install(Vue: any){
    Vue.component(ComponentName, Calendar)
  }
}