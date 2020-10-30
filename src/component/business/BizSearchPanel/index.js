import component from './BizSearchPanel.vue';

const BizSearchPanel = {
  install(Vue){
    Vue.component(component.name, component);
  },
  component
}

export default BizSearchPanel;