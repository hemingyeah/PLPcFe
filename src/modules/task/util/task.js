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
        return task.customer = {
          id: customer[0].value
        };
      }  
    }

    if(fieldName === 'customerAddress'){
      let customerAddress = form.customerAddress || {};
      // address
      return task.customerAddress = {
        adCountry: '',
        adProvince: customerAddress.province,
        adCity: customerAddress.city,
        adDist: customerAddress.dist,
        adLatitude: customerAddress.latitude || '',
        adLongitude: customerAddress.longitude || '',
        addressType: customerAddress.addressType || 0,
        adAddress: customerAddress.address,
      };
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


