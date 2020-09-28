import component from './BizProcess';

const BizProcess = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default BizProcess;