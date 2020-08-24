import {toArray} from '@src/util/lang';

/** 将form对象转成客户对象，用于提交表单 */
export function packToTask(fields, form){
  let task = {
    id: form.id,
    attribute: {}
  };

  fields.forEach(field => {
    let {fieldName, isSystem} = field;
    let value = form[fieldName];

    if(fieldName === 'customer'){
      let customer = form.customer || [];
      // customer
      if(customer[0]){
        task.customer = {
          id: customer[0].value
        };
      }

      // 客户联系人
      if(form.linkman && form.linkman[0]){
        let linkman = form.linkman[0];
        task.tlmId = linkman.value;
        task.tlmName = linkman.name;
        task.tlmPhone = linkman.phone;
      }
      
      // 客户地址
      if(form.address && form.address[0]){
        let address = form.address[0];
        let taddress = {};
        taddress.id = address.value;
        taddress.province = address.province;
        taddress.city = address.city;
        taddress.dist = address.dist;
        taddress.latitude = address.latitude;
        taddress.longitude = address.longitude;
        taddress.address = address.address;

        task.taddress = taddress;
      } 

      // 产品
      if(form.product && form.product.length > 0){
        task.products = [];
        form.product.map(product => {
          task.products.push({
            id: product.id,
            name: product.name,
            serialNumber: product.serialNumber,
            type: product.type
          })
        })
      }
      return;
    }

    if (field.formType === 'address' && !field.isSystem) {
      let all = value.province + value.city + value.dist + value.address;
      if(all) {
        value.all = all;
      }
    }
    
    if (field.formType === 'location') {
      value = {};
    }

    if (fieldName === 'attachment') {
      // 拼附件和回执附件
      value = value.concat(form.receiptAttachment);
    }
    
    isSystem == 0
      ? task.attribute[fieldName] = value
      : task[fieldName] = value;
  });

  return task;
}

/** 将工单对象转成form表单，用于初始化表单 */
export function packToForm(fields, data){
  if (!data.id) return;
  
  let task = {
    id: data.id,
    taskNo: data.taskNo,
    templateName: data.templateName,
    ...data.attribute
  };

  fields.forEach(field => {
    let {fieldName, isSystem} = field;
    let value = data[fieldName];

    if(fieldName === 'customer'){
      // 初始化客户
      task.customer = [{
        value: value.id,
        label: value.name
      }];

      // 初始化联系人
      task.linkman = [{
        value: data.tlmId,
        label: data.tlmName + data.tlmPhone,
        name: data.tlmName,
        phone: data.tlmPhone
      }];

      // 初始化地址
      task.address = [];
      if (data.taddress.id) {
        task.address = [{
          value: data.taddress.id,
          label: data.taddress.province + data.taddress.city + data.taddress.dist + data.taddress.address,
          ...data.taddress
        }];
      }

      // 初始化产品
      data.products.length && data.products.map(item => {
        item.value = item.id;
        item.label = item.name;
      })
      task.product = data.products;

      return;
    }

    if (fieldName === 'attachment') {
      // 分离附件和回执附件
      if (value.length) {
        task.receiptAttachment = value.filter(img => img.receipt);
        value = value.filter(img => !img.receipt);
      }
    }

    isSystem == 1 && (task[fieldName] = value);

  });

  return task;
}


