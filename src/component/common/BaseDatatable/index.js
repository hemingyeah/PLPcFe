import './common.scss'
import BaseDatatable from './BaseDatatable.vue';

BaseDatatable.install = function(Vue){
  Vue.component(BaseDatatable.name, BaseDatatable);
}

export default BaseDatatable;