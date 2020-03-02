/* eslint-disable vue/html-indent */
import EventBus from '@src/util/eventBus'
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
  computed: {
    _value() {
      return this.value
    },
    setting() {
      return this.field.setting || {}
    },
    required() {
      return this.field.isNull === 0
    }
  },
  mounted() {
    if (this.field.formType == 'relationCustomer') {
      EventBus.$on('es.Relation.Customer', this.update)
    }
    if (this.field.formType == 'relationProduct') {
      EventBus.$on('es.Relation.Product', this.update)
    }
  },
  methods: {
    async update(forRelation) {  
      let action = 'task/relatedFieldValue'
      let oldValue = this._value
      console.info('oldvalue: ', oldValue);
      
      let newValue
      forRelation.fieldName = this.setting.fieldName
      forRelation.formType = this.setting.formType
      if (forRelation.from == 'event') action = 'event/relatedFieldValue'
      console.info('forRelation:', forRelation)
      if (forRelation.id && forRelation.id !== '') { 
        this.$http.get('/task/getRelatedInfo', forRelation).then(res => {
          if(res.status == 0){
            newValue = res.data
            this.$emit('update', {newValue, oldValue, field: this.field})
          }
        }).catch(err => console.error(err))
      } 
    }
  }
}
