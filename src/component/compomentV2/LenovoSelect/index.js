import component from './index.vue';

const LenovoSelect = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default LenovoSelect;