/**
 * @description 客户地址select数据转换
*/
export function customerAddressSelectConversion(customerAddress: any): any {
  if(!customerAddress) return {};
  
  let { province, city, dist, address, id } = customerAddress;

  return Object.freeze({
    label: `${province}${city}${dist}${address}`,
    value: id,
    ...customerAddress
  })
}

/**
 * @description 客户select数据转换
*/
export function customerSelectConversion(customer: any): any {
  if(!customer) return {};
  
  let { name, id } = customer;

  return Object.freeze({
    label: name,
    value: id,
    ...customer
  })
}

/**
 * @description 客户联系人select数据转换
*/
export function customerLinkmanSelectConversion(linkman: any): any {
  if(!linkman) return {};

  let { customer, id, isMain, name, phone } = linkman;
  let label = `姓名：${name} 电话：${phone} 客户：${customer && customer.name}`;

  return Object.freeze({ 
    customer, id, isMain, name, phone, label, value: id 
  });
}

/**
 * @description 联系人select数据转换
*/
export function linkmanSelectConversion(linkman: any): any {
  if(!linkman) return {};

  let { id, name, phone } = linkman;

  return Object.freeze({
    label: `${name} ${phone}`,
    value: id,
    ...linkman
  });
}

/**
 * @description 产品select数据转换
*/
export function productSelectConversion(product: any): any {
  if(!product) return {};

  let { id, name, phone } = product;

  return Object.freeze({
    label: name,
    value: id,
    ...product
  });
}

/**
 * @description 工单类型select数据转换
*/
export function taskTypeSelectConversion(taskType: any): any {
  if(!taskType) return {};
  
  return Object.freeze({
    text: taskType.name,
    value: taskType.id
  })
}