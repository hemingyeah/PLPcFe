/*
 * @Author: your name
 * @Date: 2021-03-08 14:10:06
 * @LastEditTime: 2021-03-08 14:11:50
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /shb-fe-pc/src/component/common/BaseExportGroupProduct/index.js
 */
import BaseExportGroupProduct from './BaseExportGroupProduct.vue';

BaseExportGroupProduct.install = function(Vue){
  Vue.component(BaseExportGroupProduct.name, BaseExportGroupProduct);
};

export default BaseExportGroupProduct;
