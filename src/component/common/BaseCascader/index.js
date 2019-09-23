import BaseCascader from './BaseCascader.vue';
// import BaseCascader from './Test.vue';

BaseCascader.install = function(Vue){
  Vue.component(BaseCascader.name, BaseCascader);
};

export default BaseCascader;