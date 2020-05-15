import BaseComment from './BaseComment.vue';

BaseComment.install = function(Vue){
  Vue.component(BaseComment.name, BaseComment);
};

export default BaseComment;