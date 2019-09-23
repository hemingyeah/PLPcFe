import { toArray } from '@src/util/lang';
import { fmt_address } from '@src/filter/fmt';
import { isHiddenField } from './util';
import { FormFieldMap } from './components';
import platform from '@src/platform'

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g

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
    buildAddressDom(address) {
      const { value, displayName, originalVal} = address;
      const map = {
        address: originalVal,
        title: displayName,
      };
    
      return (
        <div class="form-view-row">
          <label>{displayName}</label>
          <div class="form-view-row-content">
            <span>{value}</span>
            {value && <i onClick={() => this.openMap(map)} class="iconfont icon-address customer-address-icon"></i>}
          </div>
        </div>
      )
    },
    buildTextarea({displayName, value, formType}) {
      const newVal = value ? value.replace(link_reg, (match) => {
        // return `<a href=${match} traget="_blank" >${match}</a>`
        return `<a href="javascript:;" target="_blank" url="${match}">${match}</a>`
      }) : '';

      return (
        <div class="form-view-row">
          <label>{displayName}</label>
          <div class="form-view-row-content">
            <span domPropsInnerHTML={newVal} class="form-view-textarea-content" onClick={(e) => {
              e.stopPropagation();
              let url = e.target.getAttribute('url');

              if (!url) return;
              if (!/http/gi.test(url)) return platform.alert('请确保输入的链接以http或者https开始');

              platform.openLink(url)
            }}>{newVal}</span>
          </div>
        </div>
      )
    },
    buildInfoDom(info) {
      const value = info.value;
      return (
        <div class="form-view-row">
          <div class="form-view-row-content form-view-info-content">
            {value}
          </div>
        </div>
      )
    },

    openMap({address, title}) {
      if (!address) return;
      this.$fast.map.display(address, {title })
        .catch(err => console.error('openMap catch an err: ', err));
    },
  
    mapFieldToDom(field, createElement) {
      let {formType, fieldName, displayName, isSystem} = field;
      if (formType === 'separator') {
        const cn = `iconfont icon-nav-down ${!this.sectionState[field.id] && 'reversal'}`;
        return displayName ? (
          <h4 class="section-title">
            {displayName}
            <i class={cn} onClick={() => this.toggleDisplay(field.id)}></i>
          </h4>
        ) : null;
      }
      
      const originalObj = this.value;
      
      let params = {};
      let value = isSystem ? originalObj[fieldName] : originalObj.attribute && originalObj.attribute[fieldName];
      
      params = {displayName, value, formType};
      
      if(this.$slots[fieldName]) {
        return this.$slots[fieldName];
      }

      // return slot
      if (this.$scopedSlots[fieldName]) {
        return this.$scopedSlots[fieldName](params);
      }

      // 组件默认视图
      let FormField = FormFieldMap.get(field.formType);
      if(FormField && FormField.view){
        let attrs = {props: {field, value}}
        return createElement(FormField.view, attrs);
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
          value: value && (value.displayName || value.name)
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
      
      if (formType === 'address') {
        params = {
          ...params,
          value: fmt_address(value),
          originalVal: value
        };
        
        return this.buildAddressDom(params);
      }

      if (formType == 'info') {
        params = {
          ...params,
          value: field.placeHolder
        };
        return this.buildInfoDom(params);
      }

      if(formType === 'textarea') {
        params = {
          ...params,
          value: value
        };
        return this.buildTextarea(params);
      }
      
      // other types: text date number datetime phone
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

      return newArr;
    }
  },
  render(h) {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    let groups = this.groupField(this.fields);
    
    let domGroups = groups.map(group => {
      let currentGroupId = 0;
      
      let title = group.filter(f => f.formType === 'separator').map(item => {
        currentGroupId = item.id;
        if (this.sectionState[currentGroupId] === undefined) {
          this.$set(this.sectionState, currentGroupId, true);
        }
        return this.mapFieldToDom(item, h);
      });

      let items = group.filter(f => f.formType !== 'separator').map(item => this.mapFieldToDom(item, h));
      
      return (
        <div class="view-group">
          {title}
          <div class="items-of-group">{
            (this.sectionState[currentGroupId] !== false) && items
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
