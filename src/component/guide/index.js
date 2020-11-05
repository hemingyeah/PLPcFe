import component from './Guide.vue';

const Guide = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default Guide;