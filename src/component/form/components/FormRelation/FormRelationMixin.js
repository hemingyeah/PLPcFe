/* eslint-disable vue/html-indent */
/* api */
import { getTaskRelatedInfo } from '@src/api/TaskApi.ts';
/* utils */
import _ from 'lodash';

export default {
  name: 'form-relation-mixin',
  props: {
    field: {
      type: Object,
      default: {}
    },
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      eventNameMap: {
        'relationCustomer': 'es.Relation.Customer',
        'relationProduct': 'es.Relation.Product'
      }
    }
  },
  computed: {
    _value() {
      return this.value
    },
    /** 
     * @description 获取管理字段 函数对象
     * -- 因为后端 工单/事件 查询虽然分了不同的接口，但是都是相同的查询
    */
    getTaskRelatedInfoFuncMap() {
      return {
        'task': getTaskRelatedInfo,
        'event': getTaskRelatedInfo,
      }
    },
    isTaskField() {
      return this.tableName === 'task';
    },
    isEventField() {
      return this.tableName === 'event';
    },
    required() {
      return this.field.isNull === 0;
    },
    setting() {
      return this.field.setting || {}
    },
    tableName() {
      return this.field.tableName || '';
    }
  },
  mounted() {
    let formType = this.field.formType;
    let eventName = this.eventNameMap[formType];

    if (eventName) {
      this.$eventBus.$on(eventName, this.update);
    }
  },
  methods: {
    async update(forRelation) {
      if (Object.keys(forRelation).length) {
        let params = JSON.parse(JSON.stringify(forRelation));
        let oldValue = this._value;
        let newValue = _.cloneDeep(this.value);

        params.fieldName = this.setting.fieldName;
        params.formType = this.setting.formType;

        let getTaskRelatedInfoFunc = this.getTaskRelatedInfoFuncMap[this.tableName];

        if(!params.id || !getTaskRelatedInfoFunc) return

        // 更新关联项数据
        getTaskRelatedInfoFunc(params)
          .then(res => {
            if(res.status == 0){
              newValue = res.data
              this.$emit('update', {newValue, oldValue, field: this.field})
            }
          }).catch(err => {
            console.error(err)
          })
      } else {
        this.$emit('update', {newValue: '', field: this.field});
      }
    }
  }
}
