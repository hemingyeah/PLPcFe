import BaseModal from './BaseModal.vue';

BaseModal.install = function(Vue){
  Vue.component(BaseModal.name, BaseModal);
}

export default BaseModal;