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
import BaseTabBar from './common/BaseTabBar';
import BaseTimeline from './common/BaseTimeline';
import BaseComment from './common/BaseComment';
import BaseSpin from './common/BaseSpin';
import BaseButton from './common/BaseButton';
import BaseSelect from './common/BaseSelect';
import BaseContextMenu from './common/BaseContextMenu'
import BaseTable from './common/BaseTable';

import TsxComp from './common/TsxComp/index.tsx'

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
  BaseTabBar,
  BaseTimeline,
  BaseComment,
  BaseSpin,
  BaseButton,
  BaseSelect,

  BaseContextMenu,
  BaseTable,
  TsxComp
];

export default {
  install: function(Vue, opts = {}){
    components.forEach(component => Vue.use(component))
  }
}