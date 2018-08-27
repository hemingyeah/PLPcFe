import './common.scss';

import FormDesign from './FormDesign';
import FormBuilder from './FormBuilder'

const Form = {
  install(Vue){
    Vue.component(FormDesign.name, FormDesign)
    Vue.component(FormBuilder.name, FormBuilder)
  }
};

export default Form;