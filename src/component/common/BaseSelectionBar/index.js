import './index.scss'
import component from './BaseSelectionBar';

const BaseSelectionBar = {
  install(Vue){
    Vue.component(component.name, component)
  },
  component
}

export default BaseSelectionBar