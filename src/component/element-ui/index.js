/** 
 * element-ui 组件按需引入，切忌引入不必要组件，部分组件因适用性原因弃用
 * 以下组件切忌引入：
 * Upload
 * 
 * @see http://element-cn.eleme.io/#/zh-CN/component/quickstart 
 */

import './element-variables.scss'
import {
  Pagination,
  Table,
  TableColumn,
  Input,
  DatePicker,
  Select,
  Option
} from 'element-ui';

const ElementUI = {
  install(Vue){
    Vue.prototype.$ELEMENT = { size: 'small'};

    //分页组件
    Vue.use(Pagination);

    //表格组件
    Vue.use(Table);
    Vue.use(TableColumn);

    Vue.use(Input);
    Vue.use(DatePicker);
    Vue.use(Select);
    Vue.use(Option)
  }
};

export default ElementUI;