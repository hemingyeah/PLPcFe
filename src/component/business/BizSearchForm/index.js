import component from './BizSearchForm.vue';

const BizSearchForm = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default BizSearchForm;