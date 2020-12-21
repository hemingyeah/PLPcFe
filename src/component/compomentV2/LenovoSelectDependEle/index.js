import component from './index.vue';

const LenovoSelectDependEle = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default LenovoSelectDependEle;