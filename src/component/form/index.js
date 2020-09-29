import './common.scss';

import {BuildComponents, ViewComponents} from './components';
import FormDesign from './FormDesign';
import FormBuilder from './FormBuilder';
import FormView from './FormView';
import FormItem from './FormItem.vue';

const Form = {
  install(Vue){
    let components = {...BuildComponents, ...ViewComponents};
    Object.keys(components).forEach(name => Vue.component(name, components[name]));

    Vue.component(FormDesign.name, FormDesign);
    Vue.component(FormBuilder.name, FormBuilder);
    Vue.component(FormView.name, FormView);
    Vue.component(FormItem.name, FormItem);
  }
};

export default Form;