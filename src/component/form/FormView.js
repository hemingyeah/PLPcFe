import { toArray } from '@src/util/lang';
import { fmt_address } from '@src/filter/fmt';
import { isHiddenField, getValue } from './util';

// TODO: 支持view component

function formatValue(field, value, model, h){
  let {formType, setting} = field;

  if (formType === 'attachment') {
    return toArray(value).map(a => <base-file-item file={a} readonly key={a.id}/>)
  }
  
  if (formType === 'select' && setting.isMulti) {
    return toArray(value).join('，')
  }
  
  if (formType === 'user') {
    return value && (value.displayName || value.name)
  }
  
  if (formType === 'customerAddress') {
    return fmt_address(value)
  }

  return value;
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
      let className = {
        'form-view-row-content': true,
        'form-view-textarea-preview': formType === 'textarea',
        'base-file__preview': formType === 'attachment',
      };
      
      return (
        <div class="form-view-row">
          <label>{displayName}</label>
          <div class={className}>{value}</div>
        </div>
      )
    },
    mapFieldToDom(field, h) {
      let {formType, fieldName, displayName} = field;

      // slot 
      if(this.$slots[fieldName]) {
        return this.$slots[fieldName];
      }
      
      let value = getValue(field, this.value)
      let params = {displayName, value, formType};

      // scopedSlot
      if (this.$scopedSlots[fieldName]) {
        return this.$scopedSlots[fieldName](params);
      }

      params.value = formatValue(field, value, this.value, h)
      
      // other types: text textarea date number datetime phone
      return this.buildCommonDom(params);
    },
    groupField(fields) {
      let newArr = [];
      let preIndex = 0;
      
      fields
        // 隐藏不显示逻辑项
        .filter(item => !isHiddenField(item, this.value, fields, false))
        // 隐藏无内容的分割线
        .filter((field, index, arr) => {
          if(field.formType != 'separator') return true;

          let next = arr[index + 1];
          return null != next && next.formType != 'separator';
        })
        // 根据分割线分组
        .forEach((f, index, filterArr) => {
          if (f.formType === 'separator') {
            newArr.push(filterArr.slice(preIndex, index));
            preIndex = index;
          }

          if (index === filterArr.length - 1) {
            newArr.push(filterArr.slice(preIndex));
          }
        });

      return newArr.map(arr => {
        let tField = arr.find(a => a.formType == 'separator') || {}

        return {
          id: tField.id,
          displayName: tField.displayName,
          list: arr.filter(a => a.formType != 'separator')
        }
      });
    }
  },
  render(h) {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    let groups = this.groupField(this.fields);
    
    let domGroups = groups.map(group => {  
      let title = null;
      if(group.displayName){
        if (this.sectionState[group.id] === undefined) {
          this.$set(this.sectionState, group.id, true);
        }

        const icon = `iconfont icon-nav-down ${!this.sectionState[group.id] && 'reversal'}`;
        title = (
          <h4 class="section-title">
            {group.displayName}
            <i class={icon} onClick={() => this.toggleDisplay(group.id)}></i>
          </h4>
        );
      }
      
      return (
        <div class="view-group">
          {title}
          <div class="items-of-group">
            {
              this.sectionState[group.id] !== false 
                ? group.list.map(item => this.mapFieldToDom(item, h))
                : null
            }
          </div>
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
