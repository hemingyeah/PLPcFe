import {toArray} from '@src/util/lang';
import {fmt_address} from '@src/filter/fmt'

const FormView = {
  name: 'form-view',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    },
  },
  methods: {
    buildCommonDom({displayName, value, formType}) {
      let clazz = {
        'form-view-row-content': true,
        'form-view-textarea-preview': formType == 'textarea',
        'base-file__preview': formType == 'attachment',
      }

      return (
        <div class="form-view-row">
          <label>{displayName}</label>
          <div class={clazz}>{value}</div>
        </div>
      )
    },
    mapFieldToDom() {
      const originalObj = this.value;
      let params = {};
      let value = '';
      
      return this.fields.map(({formType, fieldName, displayName, isSystem,}) => {
        
        value = isSystem ? originalObj[fieldName] : originalObj.attribute[fieldName];
        params = {displayName, value, formType};
        
        // return slot
        if (this.$scopedSlots[formType]) {
          return this.$scopedSlots[formType](params);
        }
        
        if (formType === 'attachment') {
          params = {
            ...params,
            value: toArray(value).map(a => <base-file-item file={a} readonly key={a.id}/>),
          };
        }
        
        if (formType === 'selectMulti') {
          params = {
            ...params,
            value: toArray(value).join(' '),
          };
        }
  
        if (formType === 'tags') {
          params = {
            ...params,
            value: toArray(value).map(t => t.tagName).join(' '),
          };
        }
  
        if (formType === 'user') {
          params = {
            ...params,
            value: value && value.displayName,
          };
        }
  
        if (formType === 'address') {
          params = {
            ...params,
            value: fmt_address(value),
          };
        }
        // other types: text textarea date number datetime phone
        return this.buildCommonDom(params);
      });
    },
  },
  render() {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    return (
      <div class="form-view">
        {this.mapFieldToDom()}
      </div>
    )
  },
  // mounted() {}
};

export default FormView;
