import './FormDesign.scss';

import FormText from './FormText';
import FormSelect from './FormSelect';

import FormDesign from './FormDesign';
import FormBuilder from './FormBuilder';

const FORM_FIELD = [
  FormText,
  FormSelect
];

const MODES = {
  base: {
    fields: [FormText.formType, FormSelect.formType]
  },
  task: {
    fields: [FormText.formType]
  }
}

const FormDesignIns = new FormDesign(FORM_FIELD, MODES);
const FormDesignCopm = FormDesignIns.genComponent();

const Form = {};
Form.install = function(Vue){
  Vue.component(FormDesignCopm.name, FormDesignCopm)
}

export default Form;