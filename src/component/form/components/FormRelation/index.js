const FormCustomerRelation = {
  formType: 'relationCustomer',
  name: '客户关联字段',
  component: {
    setting: {
      name: 'form-relation-customer-setting',
      render(){
        return <div>form relation customer setting</div>
      }
    },
    preview: {
      name: 'form-relation-customer-preview',
      render(){
        return <div>form relation customer preview</div>
      }
    },
    build: {
      name: 'form-relation-customer',
      render(){
        return <div>form relation customer</div>
      }
    }
  }
}

const FormProductRelation = {
  formType: 'relationProduct',
  name: '产品关联字段',
  component: {
    setting: {
      name: 'form-relation-product-setting',
      render(){
        return <div>form relation product setting</div>
      }
    },
    preview: {
      name: 'form-relation-product-preview',
      render(){
        return <div>form relation product preview</div>
      }
    },
    build: {
      name: 'form-relation-product',
      render(){
        return <div>form relation product</div>
      }
    }
  }
}

export default [
  FormCustomerRelation,
  FormProductRelation
]