import FormRelationSetting from './FormRelationSetting.vue'
import FormRelationPreview from './FormRelationPreview.vue'
import FormRelation from './FormRelation.vue'
const FormCustomerRelation = {
  formType: 'relationCustomer',
  name: '客户关联字段',
  component: {
    setting: FormRelationSetting,
    preview: FormRelationPreview,
    build: FormRelation
  }
}

const FormProductRelation = {
  formType: 'relationProduct',
  name: '产品关联字段',
  component: {
    setting: FormRelationSetting,
    preview: FormRelationPreview,
    build: FormRelation
  }
}

export default [FormCustomerRelation, FormProductRelation]
