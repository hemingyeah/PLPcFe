const FormCustomerField = {
  formType: 'customer',
  name: '客户',
  isSystem: 1,
  component: {
    setting: {
      name: 'form-customer-setting',
      render(){
        return <div>form customer setting</div>
      }
    },
    preview: {
      name: 'form-customer-preview',
      render(){
        return <div>form customer preview</div>
      }
    },
    extend: {
      
    }
  }
};

export default FormCustomerField;