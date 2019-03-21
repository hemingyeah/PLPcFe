import component from './BaseContextMenu.vue';
import item from './BaseContextMenuItem.vue'

const BaseContextMenu = {
  install(Vue){
    Vue.component(component.name, component)
    Vue.component(item.name, item)
  }
}

export default BaseContextMenu;