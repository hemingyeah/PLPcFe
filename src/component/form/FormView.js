import BasFileItem from '@src/component/common/BaseFileItem';

const util = {
  /**
   * 是否为多选类型
   */
  isMultiSelect(field) {
    let setting = field.setting || {};
    
    return (field.formType == 'select' && setting.isMulti) || field.formType == 'selectMulti';
  },
  
  /**
   * 是否为单选类型
   */
  isSelect(field) {
    let setting = field.setting || {};
    
    return (field.formType == 'select' && !setting.isMulti)
      || field.formType == 'level'
      || field.formType == 'serviceContent'
      || field.formType == 'serviceType';
  },
  
  /**
   * 是否为数组类型
   */
  isArray(field) {
    return this.isMultiSelect(field) || field.formType == 'attachment' || field.formType == 'cascader' || field.formType == 'tags';
  }
};


class Factory {
  
  /**
   * FormBuilder工厂类
   * @param {*} createElement Vue提供的创建VNode的方法
   * @param {*} ctx 当前组件
   *
   * @see {@link https://cn.vuejs.org/v2/guide/render-function.html#createElement-%E5%8F%82%E6%95%B0}
   */
  constructor(createElement, ctx) {
    this.h = createElement;
    this.ctx = ctx;
  }
  
  /**
   * 创建组件
   *
   * 以下类型的字段必须通过slot插槽传入
   *
   *  eventNo
   *  customer
   *
   * @param {*} field    字段信息
   * @param {*} children 子组件
   * @param {*} _private 是否内部组件
   */
  create(field, children = [], _private = false) {
    if (field.formType == 'form-view' && _private) return this.root(field, children)
    // if (field.formType == 'customer') return this.customer(field);
    // if (field.formType == 'eventNo') return this.eventNo(field);
    // if (field.formType == 'taskNo') return this.taskNo(field);
    if (field.formType == 'attachment') return this.attachment(field);
    // if (field.formType == 'phone') return this.phone(field)
    // if (field.formType == 'planTime') return this.planTime(field)
    if (field.formType == 'user') return this.user(field)
    if (field.formType === 'address') return this.address(field);
    
    return this.common(field)
  }
  
  /**
   * 根组件
   */
  root(field, children) {
    let data = {
      'class': ['form-viewer'],
      key: field.id
    };
    
    const root = this.h('div', data, children)
    return root;
  }
  
  /**
   * 事件编号 -- 作用域插槽
   *
   */
  eventNo(field) {
    let value = this.getValue(field) || {};
    return this.ctx.$scopedSlots.eventNo({
      eventNo: value
    })
  }
  
  address(field) {
    let value = this.getValue(field) || [];
    let address = this.prettyAddress(value);
    return this.ctx.$scopedSlots.address({
      area: address[0] || '',
      address: address[1] || '',
    })
  }
  
  taskNo(field) {
    let value = this.getValue(field) || {};
    return this.ctx.$scopedSlots.taskNo({
      taskNo: value
    });
  }
  
  /**
   * 客户 -- 作用域插槽
   */
  customer(field) {
    let value = this.getValue(field) || {};
    return this.ctx.$scopedSlots.customer({
      customer: value,
      // customerOption: field.setting.customerOption
    });
  }
  
  /**
   * 附件预览
   */
  attachment(field) {
    let value = this.getValue(field);
    let left = this.rowLeft(field.displayName);
    
    const atta = value
      .map(atta => {
        let data = {
          props: {
            del: false,
            file: atta
          }
        };
        return this.h('base-file-item', data)
      });
    let right = this.h('div', {
      'class': 'app-row-right'
    }, atta);
    
    return this.h('div', {class: 'app-row',}, [left, right]);
  }
  
  /**
   * 计划时间
   */
  planTime(field) {
    let value = this.getValue(field)
    return this.ctx.$scopedSlots.planTime({
      planTime: value
    })
  }
  
  /**
   * 通用显示
   */
  common(field) {
    let left = this.rowLeft(field.displayName);
    let right = this.rowRight(this.prettyText(field));
    return this.row(field, [left, right]);
  }
  
  row(field, children = []) {
    let data = {
      'class': 'app-row',
      key: field.id
    };
    
    return this.h('div', data, children);
  }
  
  rowLeft(text) {
    let data = {
      'class': 'app-row-left'
    };
    return this.h('div', data, [text]);
  }
  
  rowRight(text) {
    let data = {
      'class': 'app-row-right'
    };
    return this.h('div', data, [text]);
  }
  
  
  phone(field) {
    let left = this.rowLeft(field.displayName);
    let right = this.rowRightPhone(this.prettyText(field))
    return this.row(field, [left, right]);
  }
  
  user(field) {
    let left = this.rowLeft(field.displayName)
    let right = this.rowRight(this.prettyText(field))
    return this.row(field, [left, right])
  }
  
  rowRightPhone(phoneNumber) {
    let data = {
      'class': 'app-row-right',
      on: {
        click: (event) => {
          this.showCallMenu(event)
        }
      }
    };
    let children
    if (!phoneNumber || phoneNumber == '') {
      children = [
        this.h('span', {
          'class': 'link'
        }, [phoneNumber])
      ];
    } else {
      children = [
        this.h('span', {
          'class': 'link'
        }, [phoneNumber]),
        this.h('i', {
          'class': 'iconfont icon-call task-call-icon'
        })
      ]
    }
    return this.h('div', data, children);
  }
  
  showCallMenu(event) {
    let number = event.target.textContent
    if (!number || number == '') return;
    this.ctx.$dd.tel.showCallMenu(number);
  }
  
  /**
   * 根据field获取对应的值
   * @param {*} field
   */
  getValue(field) {
    let origin = this.ctx.value;
    let attribute = origin.attribute || {};
    
    let setting = field.setting || {};
    let fieldName = field.fieldName;
    
    //如果是自定义有字段则去attribute中的值
    let value = field.isSystem == 1 ? origin[fieldName] : attribute[fieldName];
    if (util.isArray(field) && !Array.isArray(value)) value = [];
    return value;
  }
  
  /**
   * 格式化value显示
   * @param {*} field
   */
  prettyText(field) {
    let value = this.getValue(field);
    let formType = field.formType;
    
    // if (field.formType == 'address') return this.prettyAddress(value).join('');
    if (field.formType == 'user') {
      return value ? (value.displayName ? value.displayName : '') : ''
    }
    
    if (field.formType === 'tags') {
      return value && value.map(tag => tag.tagName).join(' ');
    }
    
    if (formType == 'cascader') return value.join('/');
    
    return Array.isArray(value) ? value.join(',') : value;
  }
  
  /**
   * 格式化地址显示
   */
  prettyAddress(adr = {}) {
    let province = adr.adProvince || adr.province || '';
    let city = adr.adCity || adr.city || '';
    let dist = adr.adDist || adr.dist || '';
    let address = adr.adAddress || adr.address || '';
    
    return [`${province}${city}${dist}`, address];
  }
  
}

const FormView = {
  name: 'customer-view',
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    },
    mode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      init: false,
    }
  },
  render(h) {
    if (!this.init) return;
    let factory = new Factory(h, this);
    const renderRes = factory.create({formType: 'form-view'}, this.fields.map(item => factory.create(item)), true)
    return renderRes;
  },
  
  methods: {
    build() {
      this.init = true;
    }
  },
  mounted() {
    this.build();
  },
  components: {
    [BasFileItem.name]: BasFileItem
  }
};

FormView._util = util;

export default FormView;
