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
    // console.log('formType:', this.field.formType)
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
      let newValue
      forRelation.fieldName = this.setting.fieldName
      forRelation.formType = this.setting.formType
      if (forRelation.from == 'event') action = 'event/relatedFieldValue'
      // console.log(forRelation)
      if (forRelation.id && forRelation.id !== '') { 
        try {
          const res = await this.$http.get('/dd/task/relatedFieldValue', forRelation)
          // console.log('relation:', res)
          if(res.status == 0){
            newValue = res.data
            // this.$emit('input', {newValue, oldValue})
            this.$emit('update', {newValue, oldValue, field: this.field})
          }
        } catch (error) {
          console.error(error)
        }
      } 
    }
  }
}
