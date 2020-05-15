import component from './BaseContextMenu.js';
import item from './BaseContextMenuItem.vue'
import './BaseContextMenu.scss'

const BaseContextMenu = {
  install(Vue){
    Vue.component(component.name, component)
    Vue.component(item.name, item)
  }
}

export default BaseContextMenu;