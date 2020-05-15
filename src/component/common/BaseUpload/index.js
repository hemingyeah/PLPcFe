import BaseUpload from './BaseUpload';

BaseUpload.install = function(Vue){
  Vue.component(BaseUpload.name, BaseUpload)
}

export default BaseUpload;