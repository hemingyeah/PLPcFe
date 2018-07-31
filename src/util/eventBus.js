/**
 * @author dongls
 * 事件总线，用于全局事件监听，简化组件之间状态共享，替代部分vuex的功能
 * 事件命名规则
 * es.[模块名].[动作名](.[其他])*
 */

import Vue from 'vue';

export default new Vue();