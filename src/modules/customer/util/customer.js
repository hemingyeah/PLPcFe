function formatCustomer(originalCustomer, allTags, fields) {
  const {
    id,
    name,
    serialNumber,
    lmName,
    lmPhone,
    tags,
    customerManager,
    customerAddress,
  } = originalCustomer;
  const keys = Object.keys(originalCustomer);
  
  const notSysFields = keys.filter(k => {
    let tv = fields.filter(f => f.fieldName === k)[0];
    if (tv && tv.isSystem === 0 && originalCustomer[k]) {
      return true;
    }
    return false;
  });
  
  let customer = {
    id: id || null,
    name,
    serialNumber,
    lmName,
    lmPhone,
  };
  let attribute = {};
  
  // attribute
  notSysFields.forEach(key => {
    attribute[key] = originalCustomer[key];
  });
  
  if (Object.keys(attribute).length) {
    customer.attribute = attribute;
  }
  // tags
  if (tags && Array.isArray(tags) && tags.length) {
    customer.tags = tags.map(tag => {
      const t = allTags.filter(at => at.id === tag)[0];
      return {
        id: t.id,
        tagName: t.tagName,
      }
    });
  }
  // customer manager
  if (customerManager && customerManager.userId) {
    customer.customerManager = customerManager.userId;
    customer.customerManagerName = customerManager.displayName || '';
  }
  // address
  customer.customerAddress = {
    adCountry: '',
    adProvince: customerAddress.adAddress[0],
    adCity: customerAddress.adAddress[1],
    adDist: customerAddress.adAddress[2],
    adLatitude: customerAddress.adLatitude || '',
    adLongitude: customerAddress.adLongitude || '',
    addressType: customerAddress.addressType || 0,
    adAddress: customerAddress.detail,
  };
  
  return customer;
}

function convertCustomerToForm(originalCustomer, fields) {
  const {
    id,
    name,
    lmName,
    lmPhone,
    serialNumber,
    attribute,
    customerAddress,
    tags,
    customerManagerName,
    customerManager,
    
  } = originalCustomer;
  let form = {
    id,
    name,
    lmName,
    lmPhone,
    serialNumber,
  };
  
  // attribute
  let tv = null;
  const attrKeys = Object.keys(attribute);
  for (let i = 0; i < attrKeys.length; i++) {
    if (attrKeys[i] === 'remindCount') continue;
    
    tv = fields.filter(f => f.fieldName === attrKeys[i])[0];
    if (!tv) continue;
    if (tv && tv.setting && tv.setting.isMulti) {
      form[attrKeys[i]] = attribute[attrKeys[i]] || [];
    } else {
      form[attrKeys[i]] = attribute[attrKeys[i]] || '';
    }
  }
  
  // address
  form.customerAddress = {
    adAddress: [customerAddress.adProvince, customerAddress.adCity, customerAddress.adDist,],
    detail: customerAddress.adAddress,
    adLongitude: customerAddress.adLongitude || '',
    adLatitude: customerAddress.adLatitude || '',
    addressType: customerAddress.addressType || 0,
  }
  //tags
  if (tags && Array.isArray(tags) && tags.length) {
    form.tags = tags.map(t => t.id) || [];
  } else {
    form.tags = [];
  }
  
  if (customerManagerName && customerManager) {
    form.customerManager = {
      displayName: customerManagerName,
      userId: customerManager,
    }
  } else {
    form.customerManager = null;
  }
  
  return form;
}

export {formatCustomer, convertCustomerToForm,};
