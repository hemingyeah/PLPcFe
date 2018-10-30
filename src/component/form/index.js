import './common.scss';

import {BuildComponents} from './components';

import FormDesign from './FormDesign';
import FormBuilder from './FormBuilder';
import FormView from './FormView'
import FormItem from './FormItem.vue';

const Form = {
  install(Vue){
    Object.keys(BuildComponents).forEach(name => Vue.component(name, BuildComponents[name]));
    
    Vue.component(FormDesign.name, FormDesign);
    Vue.component(FormBuilder.name, FormBuilder);
    Vue.component(FormView.name, FormView);
    Vue.component(FormItem.name, FormItem);
  }
};

export default Form;