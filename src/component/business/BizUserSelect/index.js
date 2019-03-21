import './index.scss'
import component from './BizUserSelect';

const BizUserSelect = {
  install(Vue){
    Vue.component(component.name, component)
  },
  component
}

export default BizUserSelect