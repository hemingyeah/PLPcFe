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
        task.tlmId = linkman.id;
        task.tlmName = linkman.name;
        task.tlmPhone = linkman.phone;
      }
      
      // 客户地址
      if(form.address && form.address[0]){
        let address = form.address[0];
        let taddress = {};
        taddress.id = address.id;
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
    
    isSystem == 0
      ? task.attribute[fieldName] = value
      : task[fieldName] = value;
  });

  return task;
}

/** 将工单对象转成form表单，用于初始化表单 */
export function packToForm(field, data, defaultAddress = {}){
  let cusAdr = data.customerAddress || defaultAddress || {};

  let attribute = {
    ...data.attribute
  };
  let form = {
    id: data.id,
    name: data.name,
    lmName: data.lmName,
    lmPhone: data.lmPhone,
    serialNumber: data.serialNumber,
    customerAddress: {
      province: cusAdr.adProvince,
      city: cusAdr.adCity,
      dist: cusAdr.adDist,
      address: cusAdr.adAddress,
      longitude: cusAdr.adLongitude || '',
      latitude: cusAdr.adLatitude || '',
      addressType: cusAdr.addressType || 0
    },
    tags: toArray(data.tags),
    manager: data.customerManager ? {displayName: data.customerManagerName, userId: data.customerManager} : null,
  };

  return Object.assign(attribute, form)
}


