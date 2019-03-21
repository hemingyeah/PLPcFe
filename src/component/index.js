import ElementUI from './element-ui';

// 通用组件
import BaseModal from './common/BaseModal';
import BasePanel from './common/BasePanel';
import BaseUpload from './common/BaseUpload';
import BaseTree from './common/BaseTree';
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

// 可快速调用的组件
import BaseMapPicker from './common/BaseMapPicker';
import BaseDistPicker from './common/BaseDistPicker';
import BaseContact from './common/BaseContact';

// 业务组件
import BizUserSelect from './business/BizUserSelect'
import BizTeamSelect from './business/BizTeamSelect'

import Form from './form';

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
  
  BizUserSelect,
  BizTeamSelect
];

export default {
  install(Vue){
    components.forEach(component => Vue.use(component))
  }
}