//import FormField from './FormField';
import {
  FormFieldMap,
  BuildComponents
} from './components';

const FormBuilder = {
  name: 'form-builder',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  methods: {
    update(field, newValue, oldValue){
      this.$emit('update', {field, newValue, oldValue})
    }
  },
  render(h){
    let formGroups = this.fields.map(field => {
      let comp = FormFieldMap.get(field.formType);
      if(comp == null) return;

      let data = {
        props: {
          field,
          value: this.value[field.fieldName]
        },
        on: {
          input: event => this.update(field, event.newValue, event.oldValue)
        }
      };

      return h(comp.build, data);
    }).filter(item => item != null);

    return (
      <div class="form-builder">
      {this.$slots.default}
      {formGroups}
      </div>
    )
  },
  components: BuildComponents
};

export default FormBuilder;