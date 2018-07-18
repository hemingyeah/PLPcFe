import BaseModal from './BaseModal';

const components = [
  BaseModal
] 

export default {
  install: function(Vue, opts = {}){
    components.forEach(component => Vue.component(component.name, component))
  }
}