import BaseModal from './common/BaseModal';
import BasePanel from './common/BasePanel';
import BaseUpload from './common/BaseUpload';

import Form from './form';

const components = [
  BaseModal,
  BasePanel,
  BaseUpload,
  Form
] 

export default {
  install: function(Vue, opts = {}){
    components.forEach(component => Vue.use(component))
  }
}