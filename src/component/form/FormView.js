import * as FormUtil from './util';

import { toArray } from '@src/util/lang';
import { fmt_date, fmt_datetime } from '@src/filter/fmt'
import { FormFieldMap } from './components';

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
    /** 格式化值 */
    formatValue(field, value){
      // 多选
      if (FormUtil.isMultiSelect(field)) {
        return toArray(value).join('，')
      }

      // 日期
      if(FormUtil.isDate(field)){
        return fmt_date(value)
      }

      // 日期时间
      if(FormUtil.isDatetime(field)){
        return fmt_datetime(value)
      }
      
      // 人员
      if (field.formType === 'user') {
        return value && (value.displayName || value.name)
      }
      
      return value;
    },
    buildCommonDom(field, value) {
      let {displayName, formType} = field;
      
      let className = {
        'form-view-row-content': true,
        'form-view-textarea-preview': formType === 'textarea'
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
      
      let value = FormUtil.getValue(field, this.value)
      // scopedSlot
      if (this.$scopedSlots[fieldName]) {
        return this.$scopedSlots[fieldName]({displayName, value, formType, field});
      }

      // 组件默认视图
      let FormField = FormFieldMap.get(field.formType);
      if(FormField && FormField.view){
        let attrs = {props: {field, value}}
        return h(FormField.view, attrs);
      }

      // 通用视图
      return this.buildCommonDom(field, this.formatValue(field, value));
    },
    groupField(fields) {
      let newArr = [];
      let preIndex = 0;
      
      fields
        // 隐藏不显示逻辑项
        .filter(item => !FormUtil.isHiddenField(item, this.value, fields, false))
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
