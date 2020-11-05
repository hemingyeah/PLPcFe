import component from './Guide.vue';

const GuideCompoment = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default GuideCompoment;