import ElementUI from './element-ui';

// 通用组件
import BaseModal from './common/BaseModal';
import BasePanel from './common/BasePanel';
import BaseUpload from './common/BaseUpload';
import BaseTree from './common/BaseTree';
import BaseTreeDept from './common/BaseTreeDept';
import BaseImport from './common/BaseImport';
import BaseExport from './common/BaseExport';
import BaseExportGroup from './common/BaseExportGroup';
import BaseFileItem from './common/BaseFileItem';
import BaseTabBar from './common/BaseTabBar';
import BaseTimeline from './common/BaseTimeline';
import BaseComment from './common/BaseComment';
import BaseSpin from './common/BaseSpin';
import BaseButton from './common/BaseButton';
import BaseSelect from './common/BaseSelect';
import BaseContextMenu from './common/BaseContextMenu'
import BaseTable from './common/BaseTable';
import BaseDistPicker from './common/BaseDistPicker';
import BaseWindow from './common/BaseWindow';
import BaseSteps from './common/BaseSteps';
import BaseCascader from './common/BaseCascader';
import BaseSelectionBar from './common/BaseSelectionBar';
import BaseServiceStar from './common/BaseServiceStar';
import BaseCollapse from './common/BaseCollapse';
import BaseCalculationFormula from './common/BaseCalculationFormula'
import BaseFlod from './common/BaseFlod/index.ts';


// 可快速调用的组件
import BaseMapDisplay from './common/BaseMapDisplay';
import BaseMapPicker from './common/BaseMapPicker';
import BaseContact from './common/BaseContact';

// 业务组件
import BizUserSelect from './business/BizUserSelect';
import BizTeamSelect from './business/BizTeamSelect';
import BizFormRemoteSelect from './business/BizFormRemoteSelect';
import BizSearchForm from './business/BizSearchForm';
import BizSearchPanel from './business/BizSearchPanel';
import BizSelectionPanel from './business/BizSelectionPanel';
import BizSearchCustomerSelect from './business/BizSearchCustomerSelect';
import BizSearchProductSelect from './business/BizSearchProductSelect';
import BizProcess from './business/BizProcess';
import BizProcessTime from './business/BizProcessTime';
import BizSelectColumn from './business/BizSelectColumn';
import BizVersionLimitDialog from '@src/component/business/BizVersionLimitDialog/index.tsx';
import BizRemoteSelect from '@src/component/business/BizRemoteSelect'

import SampleTooltip from './common/SampleTooltip';

import BaseEditor from './common/BaseEditor'

// 自定义组件
import GuideCompoment from './guide'

import LenovoSelect from './compomentV2/LenovoSelect'

import Form from './form';

const components = [
  ElementUI,
  BaseModal,
  BasePanel,
  BaseUpload,
  BaseTree,
  BaseTreeDept,
  BaseContact,
  BaseMapPicker,
  BaseDistPicker,
  BaseMapDisplay,
  Form,
  BaseImport,
  BaseExport,
  BaseExportGroup,
  BaseFileItem,
  BaseTabBar,
  BaseTimeline,
  BaseComment,
  BaseSpin,
  BaseButton,
  BaseSelect,
  BaseSteps,
  
  BaseContextMenu,
  BaseTable,
  
  BizUserSelect,
  BizTeamSelect,
  BizFormRemoteSelect,
  BizSearchForm,
  BizSearchPanel,
  BizSelectionPanel,
  BizSearchCustomerSelect,
  BizSearchProductSelect,
  BizProcess,
  BizProcessTime,
  BizSelectColumn,
  BizVersionLimitDialog,
  BizRemoteSelect,
  
  BaseWindow,
  SampleTooltip,
  BaseCascader,
  BaseSelectionBar,
  BaseEditor,
  BaseServiceStar,
  BaseCollapse,
  BaseCalculationFormula,
  
  GuideCompoment,
  ...BaseFlod,
  LenovoSelect
];

export default {
  install(Vue) {
    components.forEach(component => Vue.use(component))
  }
}