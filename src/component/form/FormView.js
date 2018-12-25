import {toArray} from '@src/util/lang';
import {fmt_address} from '@src/filter/fmt';

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
  data() {
    return {
      sectionState: {},
    }
  },
  methods: {
    toggleDisplay(id) {
      this.sectionState[id] = !this.sectionState[id];
    },
    buildCommonDom({displayName, value, formType}) {
      let clazz = {
        'form-view-row-content': true,
        'form-view-textarea-preview': formType === 'textarea',
        'base-file__preview': formType === 'attachment',
      };
      
      return (
        <div class="form-view-row">
          <label>{displayName}：</label>
          <div class={clazz}>{value}</div>
        </div>
      )
    },
    mapFieldToDom(field) {
      let {formType, fieldName, displayName, isSystem} = field;
      if (formType === 'separator') {
        const cn = `iconfont icon-nav-down ${!this.sectionState[field.id] && 'reversal'}`;
        return (
          <h4 class="section-title">
            {displayName || ' '}
            <i class={cn} onClick={() => this.toggleDisplay(field.id)}></i>
          </h4>
        );
      }
      
      const originalObj = this.value;
      
      let params = {};
      let value = '';
      
      value = isSystem ? originalObj[fieldName] : originalObj.attribute[fieldName];
      params = {displayName, value, formType};
      
      if(this.$slots[fieldName]) {
        return this.$slots[fieldName];
      }

      // return slot
      if (this.$scopedSlots[fieldName]) {
        return this.$scopedSlots[fieldName](params);
      }
      
      if (formType === 'attachment') {
        params = {
          ...params,
          value: toArray(value).map(a => <base-file-item file={a} readonly key={a.id}/>)
        };
      }
      
      if (formType === 'select' && field.setting.isMulti) {
        params = {
          ...params,
          value: toArray(value).join('，')
        };
      }
      
      if (formType === 'tags') {
        params = {
          ...params,
          value: toArray(value).map(t => t.tagName).join(' ')
        };
      }
      
      if (formType === 'select' && fieldName === 'tags') {
        params = {
          ...params,
          value: value.map(tag => tag.tagName).join('，')
        };
      }
      
      if (formType === 'user') {
        params = {
          ...params,
          value: value && value.displayName
        };
      }
      
      if (formType === 'user' && fieldName === 'manager') {
        params = {
          ...params,
          value: this.value.customerManagerName
        };
      }
      
      if (formType === 'customerAddress') {
        params = {
          ...params,
          value: fmt_address(value)
        };
      }
      // other types: text textarea date number datetime phone
      return this.buildCommonDom(params);
    },
    groupField(fields) {
      let newArr = [];
      let preIndex = 0;
      
      fields.forEach((f, index) => {
        if (f.formType === 'separator') {
          newArr.push(fields.slice(preIndex, index));
          preIndex = index;
        }
        if (index === fields.length - 1) {
          newArr.push(fields.slice(preIndex));
        }
      });
      
      return newArr;
    }
  },
  render() {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    let groups = this.groupField(this.fields);
    
    let domGroups = groups.map(group => {
      let currentGroupId = 0;
      
      let title = group.filter(f => f.formType === 'separator').map(item => {
        currentGroupId = item.id;
        if (this.sectionState[currentGroupId] === undefined) {
          this.$set(this.sectionState, currentGroupId, true);
        }
        return this.mapFieldToDom(item);
      });
      let items = group.filter(f => f.formType !== 'separator').map(item => this.mapFieldToDom(item));
      
      return (
        <div class="view-group">
          {title}
          <div class="items-of-group">{
            (this.sectionState[currentGroupId] === undefined || this.sectionState[currentGroupId]) &&
            items
          }</div>
        </div>
      );
    });
    
    return (
      <div class="form-view">
        {domGroups}
      </div>
    )
  }
};

export default FormView;
