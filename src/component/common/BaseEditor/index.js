import BaseEditor from './BaseEditor.vue';

BaseEditor.install = function(Vue){
  Vue.component(BaseEditor.name, BaseEditor);
};

export default BaseEditor;