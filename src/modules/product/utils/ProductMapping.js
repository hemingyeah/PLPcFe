import {toArray} from "@src/util/lang";

/** 将form对象转成产品对象，用于提交表单 */
export function packToProduct(fields, form){
  let product = {
    linkman: {},
    address: {}
  };
  let attribute = {};
  const {customer, template, type, serialNumber, name, id, linkman, customerAddress, catalogId, qrcodeId } = form;
  let tv = null;
  fields.forEach(f => {
    if (!f.isSystem) {
      attribute[f.fieldName] = form[f.fieldName];
    }
    
    if (f.formType === "address" && !f.isSystem) {
      tv = form[f.fieldName];
      let all = [tv.province, tv.city, tv.dist, tv.address].filter(str => !!str).join("");

      attribute[f.fieldName] = {
        ...tv,
      };

      all ? attribute[f.fieldName]["all"] = all : "";
    }
  
    if (f.formType === "location") {
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
  

  if(catalogId){
    product["catalogId"] = catalogId[0].id
  }

  if(qrcodeId){
    product["qrcodeId"] = qrcodeId
  }
  
  if (id) {
    product.id = id;
  }

  if (Array.isArray(linkman) && linkman.length) {
    product.linkman.id = linkman[0].value
  }

  if (Array.isArray(customerAddress) && customerAddress.length) {
    product.address.id = customerAddress[0].value
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
  const {id, name, serialNumber, type, templateId, templateName, customerId, customerName, address, linkman, catalogId } = product;
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

  if (linkman?.id) {
    form.linkman = [{
      value: linkman.id,
      label: linkman.name,
      phone: linkman.phone
    }]
  } else {
    form.linkman = []
  }

  if (address?.id) {
    form.customerAddress = [{
      value: address.id,
      label: address.province + address.city + address.dist + address.address
    }]
  } else {
    form.customerAddress = []
  }

  if(catalogId){
    // 产品类型关联组件解析form
    let obj = {
      id:catalogId,
      pathName:product.catalogPathName
    }
    form["catalogId"] = [obj]
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
