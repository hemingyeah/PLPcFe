import {toArray} from '@src/util/lang';

/** 将form对象转成客户对象，用于提交表单 */
export function packToCustomer(fields, form, initTags){
  let customer = {
    id: form.id,
    attribute: {}
  };

  fields.forEach(field => {
    let {fieldName, isSystem} = field;
    let value = form[fieldName];

    if(fieldName === 'customerAddress'){
      let customerAddress = form.customerAddress || {};
      // address
      return customer.customerAddress = {
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

    if(fieldName == 'tags'){
      let tags = Array.isArray(value) ? value : [];
      // COMMENT: 暂时去除团队
      customer.tags = tags.map(item => ({
        id: item.id,
        tagName: item.tagName
      }))
      // customer.tags = tags.map(tag => {
      //   let t = initTags.find(initTag => initTag.id == tag);
      //   return {
      //     id: t.id,
      //     tagName: t.tagName
      //   }
      // })
      return
    }

    if(fieldName === 'manager'){
      customer.customerManager = value.userId || '';
      customer.customerManagerName = value.displayName || ''
      return;
    }
    
    if (field.formType === 'address' && !field.isSystem) {
      
      // 兼容处理(包括旧数据)
      let all = (
        [value.province, value.city, value.dist, value.address]
          .filter(str => !!str)
          .join('')
          .replace(/undefined/g)
      );

      if(all) {
        value.all = all;
      }
    }
    
    if ((field.formType === 'location') && !value.isHaveLocation) {
      value = {};
    }
    
    isSystem == 0
      ? customer.attribute[fieldName] = value
      : customer[fieldName] = value;
  });

  return customer;
}

/** 将客户对象转成form表单，用于初始化表单 */
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


