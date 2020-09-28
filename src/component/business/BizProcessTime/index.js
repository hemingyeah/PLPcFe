import component from './BizProcessTime';

const BizProcessTime = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default BizProcessTime;