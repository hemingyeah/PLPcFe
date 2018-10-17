//
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
      const t =  allTags.filter(at => at.id === tag)[0];
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

function convertCustomerToForm(originalCustomer) {
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
  if (attribute && Object.keys(attribute).length) {
    Object.keys(attribute).forEach(key => {
      form[key] = attribute[key];
    });
  }
  
  // address
  form.customerAddress = {
    adAddress: [customerAddress.adProvince, customerAddress.adCity, customerAddress.adDist, ],
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


function convertCustomerForDisplay(originalCustomer, fields) {
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
    createTime,
    createUser,
    createLoginUser,
  } = originalCustomer;
  let customer = {
    id,
    name,
    lmName,
    lmPhone,
    serialNumber,
    customerManagerName,
    createTime,
    address: '',
    tag: '',
    createUser: {
      id: createUser,
      name: createLoginUser ? createLoginUser.displayName : '',
    },
    attribute: {},
  };
  let tv = null;
  
  if (customerAddress) {
    customer.address = {
      area: `${customerAddress.adProvince}-${customerAddress.adCity}-${customerAddress.adDist}`,
      detail: customerAddress.adAddress,
    }
  }
  
  if (tags && tags.length) {
    customer.tag = tags.map(t => t.tagName).join(' ');
  }
  // 被删除的相关属性

  // 自定义属性
  if (attribute) {
    Object.keys(attribute)
    .forEach(key => {
      tv = fields.filter(field => field.fieldName === key)[0] || {};
      customer.attribute[key] = {
        fieldName: tv.fieldName,
        displayName: tv.displayName,
        value: attribute[key],
        formType: tv.formType,
      };
      
      if (Array.isArray(attribute[key]) && tv.formType !== 'attachment') {
        customer.attribute[key].value = attribute[key].join(' ');
      }
    })
  
  }
  
  return customer;
}



export { formatCustomer, convertCustomerToForm, convertCustomerForDisplay, };
