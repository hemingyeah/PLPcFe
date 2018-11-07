import {toArray} from '@src/util/lang';
import {fmt_address} from '@src/filter/fmt';

function createGroup(fields){
  let groups = [];

  let group = {title: '',fields: []};
  fields.forEach(field => {
    if(field.formType == 'separator'){
      if(group.fields.length > 0) groups.push(group);
      group = {title: field.displayName,fields: []};
      return;
    }

    group.fields.push(field);
  });

  return groups;
}

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
    mapFieldToDom(field) {
      let {formType, fieldName, displayName, isSystem} = field;
      if(formType == 'separator') {
        return (
          <div class="form-view-separator">
            {displayName ? <span>{displayName}</span> : null}
          </div>
        );
      }
      
      const originalObj = this.value;

      let params = {};
      let value = '';
        
      value = isSystem ? originalObj[fieldName] : originalObj.attribute[fieldName];
      params = {displayName, value, formType};
      
      // return slot
      if (this.$scopedSlots[formType]) {
        return this.$scopedSlots[formType](params);
      }
      
      if (formType === 'attachment') {
        params = {
          ...params,
          value: toArray(value).map(a => <base-file-item file={a} readonly key={a.id}/>)
        };
      }
      
      if (formType === 'selectMulti') {
        params = {
          ...params,
          value: toArray(value).join(' ')
        };
      }

      if (formType === 'tags') {
        params = {
          ...params,
          value: toArray(value).map(t => t.tagName).join(' ')
        };
      }

      if (formType === 'user') {
        params = {
          ...params,
          value: value && value.displayName
        };
      }

      if (formType === 'address') {
        params = {
          ...params,
          value: fmt_address(value)
        };
      }
      // other types: text textarea date number datetime phone
      return this.buildCommonDom(params);
    },
  },
  render() {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    //let groups = createGroup(this.fields);

    // let viewGroups = groups.map(group => {
    //   let groupTitle = null;
    //   if(group.title) groupTitle = <h3 class="form-view-group-title"><span>{group.title}</span></h3>

    //   let viewItems = group.fields.map(field => this.mapFieldToDom(field))

    //   return [
    //     groupTitle,
    //     <div class="form-view-group">
    //       {viewItems}
    //     </div>
    //   ]
    // })

    // return (
    //   <div class="form-view">
    //     {viewGroups}
    //   </div>
    // )

    let viewItems = this.fields.map(item => this.mapFieldToDom(item));

    return (
      <div class="form-view">
        {viewItems}
      </div>
    )
  }
};

export default FormView;
