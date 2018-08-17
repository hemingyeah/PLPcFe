import BaseModal from './common/BaseModal';
import Form from './form';

const components = [
  BaseModal,
  Form
] 

export default {
  install: function(Vue, opts = {}){
    components.forEach(component => Vue.use(component))
  }
}