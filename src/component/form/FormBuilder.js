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
      let formType = field.formType;
      let comp = FormFieldMap.get(formType);

      let data = {
        props: {
          field
        },
        on: {
          input: event => this.update(field, event.newValue, event.oldValue)
        }
      };

      return h(comp.build, data)
    });

    return (
      <div class="form-builder">
      {formGroups}
      </div>
    )
  },
  components: BuildComponents
};

export default FormBuilder;