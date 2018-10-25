import ElementUI from './element-ui';
import BaseModal from './common/BaseModal';
import BasePanel from './common/BasePanel';
import BaseUpload from './common/BaseUpload';
import BaseTree from './common/BaseTree';
import BaseContact from './common/BaseContact';
import BaseMapPicker from './common/BaseMapPicker';
import BaseDistPicker from './common/BaseDistPicker';
import BaseImport from './common/BaseImport';
import BaseExport from './common/BaseExport';
import BaseFileItem from './common/BaseFileItem';
import BaseTabPane from './common/BaseTabPane';

import Form from './form';
import Fast from './fast'

const components = [
  ElementUI,
  BaseModal,
  BasePanel,
  BaseUpload,
  BaseTree,
  BaseContact,
  BaseMapPicker,
  BaseDistPicker,
  Form,
  Fast,
  BaseImport,
  BaseExport,
  BaseFileItem,
  BaseTabPane
];

export default {
  install: function(Vue, opts = {}){
    components.forEach(component => Vue.use(component))
  }
}