import './index.scss'
import RemoteSearchSelector from './RemoteSearchSelector';

RemoteSearchSelector.install = function(Vue){
  Vue.component(RemoteSearchSelector.name, RemoteSearchSelector);
};

export default RemoteSearchSelector;
