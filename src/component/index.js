import BaseModal from './common/BaseModal';
import BasePanel from './common/BasePanel';

import Form from './form';

const components = [
  BaseModal,
  BasePanel,
  Form
] 

export default {
  install: function(Vue, opts = {}){
    components.forEach(component => Vue.use(component))
  }
}