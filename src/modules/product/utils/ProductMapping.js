import {toArray} from '@src/util/lang';

/** 将form对象转成产品对象，用于提交表单 */
export function packToProduct(fields, form){
  let product = {};
  let attribute = {};
  const {customer, template, type, serialNumber, name, id} = form;
  let tv = null;
  
  fields.forEach(f => {
    if (!f.isSystem) {
      attribute[f.fieldName] = form[f.fieldName];
    }
    
    if (f.formType === 'address' && !f.isSystem) {
      tv = form[f.fieldName];
      attribute[f.fieldName] = {
        ...tv,
        all: [tv.province, tv.city, tv.dist, tv.address].filter(str => !!str).join('')
      }
    }
  
    if (f.formType === 'location') {
      attribute[f.fieldName] = {};
    }
  
  });
  
  
  if (Array.isArray(customer) && customer.length) {
    product.customerId = customer[0].value
  }
  
  if (Array.isArray(template) && template.length) {
    product.templateId = template[0].value;
    product.templateName = template[0].label;
  }
  
  if (id) {
    product.id = id;
  }
  
  return {
    ...product,
    name,
    type,
    serialNumber,
    attribute,
  };
}


/** 将产品对象转成form表单，用于初始化表单 */
export function packToForm(field, product){
  const {id, name, serialNumber, type, templateId, templateName, customerId, customerName} = product;
  let form = {};
  
  if (customerId) {
    form.customer = [{
      value: customerId,
      label: customerName,
    }]
  } else {
    form.customer = []
  }
  
  if (templateId) {
    form.template = [{
      value: templateId,
      label: templateName
    }]
  } else {
    form.template = []
  }
  
  return {
    id,
    name,
    serialNumber,
    type,
    ...form,
    ...product.attribute,
  }
}
