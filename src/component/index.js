import BaseModal from './common/BaseModal';
import BasePanel from './common/BasePanel';
import BaseUpload from './common/BaseUpload';
import BaseTree from './common/BaseTree';
import BaseContact from './common/BaseContact';

import Form from './form';

const components = [
  BaseModal,
  BasePanel,
  BaseUpload,
  BaseTree,
  BaseContact,
  Form
] 

export default {
  install: function(Vue, opts = {}){
    components.forEach(component => Vue.use(component))
  }
}