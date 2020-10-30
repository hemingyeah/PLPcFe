import { toArray } from '@src/util/lang';
import { fmt_address, fmt_datetime, fmt_date } from '@src/filter/fmt';
import * as FormUtil from './util';
import { FieldManager } from './components';
import http from '@src/util/http';
import platform from '@src/platform';

const link_reg = /((((https?|ftp?):(?:\/\/)?)(?:[-;:&=\+\$]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\?\+=&;:%!\/@.\w_]*)#?(?:[-\+=&;%!\?\/@.\w_]*))?)/g;

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
        let { isMultiple } = field.setting || {};

        // 多选
        if(isMultiple == 1) {
          let valueArr = Array.isArray(value) ? value : [];
          return valueArr.map(i => i.displayName || i.name).join(',');
        }
        
        return value && (value.displayName || value.name)
      }
      
      return value;
    },
    buildCommonDom({displayName, value, formType}) {
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

    buildPhoneDom(lmPhone) {
      const { value, displayName} = lmPhone;
      const hasCallCenterModule = localStorage.getItem('call_center_module')
      const str = hasCallCenterModule == 1 && value ? <el-tooltip content="拨打电话" placement="top"><i onClick={() => this.makePhoneCall(value, hasCallCenterModule)} v-if="hasCallCenterModule" class="iconfont icon-dianhua1" style="color: #55B7B4;padding-left: 5px;font-size: 16px;cursor:pointer;"></i></el-tooltip> : ''
      return (
        <div class="form-view-row">
          <label>{displayName}</label>
          <div class="form-view-row-content">
            <span>{value}</span>
            {str}
          </div>
        </div>
      )
    },

    async makePhoneCall(phone, hasCallCenterModule){
      if(!phone || !hasCallCenterModule) return
      try {
        const { code, message } = await http.post('/api/callcenter/outside/callcenter/api/dialout', {phone, taskType:'customer'}, false)
        if (code !== 0) return this.$platform.notification({
          title: '呼出失败',
          message: message || '',
          type: 'error',
        })
      } catch (error) {
        console.error(error);
      }
    },

    buildTextarea({displayName, value, formType}) {
      const newVal = value ? value.replace(link_reg, (match) => {
        return `<a href="javascript:;" url="${match}">${match}</a>`
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
    buildAutoGraph({displayName, value}) {
      return (
        <div class="form-view-row">
          <label>{displayName}</label>
          <div class="form-view-row-content">
            { value && <div class="form-view-autograph-content"><img src={value} /></div> }
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
        return this.$scopedSlots[fieldName]({displayName, value, formType, field});
      }

      // 加密字段
      if (value == '***') return this.buildCommonDom(params);
      
      // 电子签名、客户签名
      if (formType === 'autograph' || formType === 'systemAutograph') {
        params = {
          ...params,
          value
        };
        return this.buildAutoGraph(params);
      }

      // 组件默认视图
      let FormField = FieldManager.findField(field.formType);
      if(FormField && FormField.view){
        let attrs = {props: {field, value}}
        return createElement(FormField.view, attrs);
      }
      
      if (formType === 'attachment' || formType === 'receiptAttachment') {
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
          value: this.formatValue(field, value)
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
     
      if (formType === 'phone' && fieldName === 'lmPhone') {
        params = {
          ...params,
          value,
        };
        
        return this.buildPhoneDom(params);
      }

      if (formType == 'info') {
        params = {
          ...params,
          value: field.placeHolder
        };
        return this.buildInfoDom(params);
      }

      // 多行文本、客户关联字段、产品关联字段
      if(formType === 'textarea' || formType === 'relationCustomer' || formType === 'relationProduct') {
        params = {
          ...params,
          value
        };
        return this.buildTextarea(params);
      }

      if (formType === 'cascader') {
        params = {
          ...params,
          value: toArray(value).join('/')
        };
      }

      if (formType === 'timestamp') {
        params = {
          ...params,
          value: fmt_datetime(value)
        };
      }
      
      // other types: text date number datetime phone
      return this.buildCommonDom(params);
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

      return newArr;
    }
  },
  render(createElement) {
    if (!this.fields.length || !Object.keys(this.value).length) return null;
    let groups = this.groupField(this.fields);
    console.log(groups, 'form-view')
    let domGroups = groups.map(group => {
      let currentGroupId = 0;
      
      let title = group.filter(f => f.formType === 'separator').map(item => {
        currentGroupId = item.id;
        if (this.sectionState[currentGroupId] === undefined) {
          this.$set(this.sectionState, currentGroupId, true);
        }
        return this.mapFieldToDom(item, createElement);
      });

      let items = group.filter(f => f.formType !== 'separator').map(item => this.mapFieldToDom(item, createElement));
      
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
