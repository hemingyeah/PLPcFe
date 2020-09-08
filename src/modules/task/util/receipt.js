/** 
* @description 将form对象转成客户对象，用于提交表单 
*/
export function packToReceipt(fields, form) {
  let expenseSheet = {
    sparePartsExpense: [],
    serviceExpense: [],
    discountExpense: {
      taskId: form.id,
      number: 1,
      type: '折扣',
      salePrice: form.disExpense
    }
  };

  let task = {
    id: form.id,
    attribute: {}
  };

  fields.forEach(field => {
    let { fieldName } = field;
    let value = form[fieldName];

    // 备件
    if(fieldName === 'sparepart'){
      value.forEach(part => {
        let o = {};
        o.id = part.id;
        o.taskId = form.id;
        o.name = part.name;
        o.serialNumber = part.serialNumber || '';
        o.number = Number(part.number) || 0;
        o.type = '备件';
        o.salePrice = part.salePrice;
        o.outPrice = part.costPrice;
        o.standard = part.standard;
        o.unit = part.unit;
        o.primaryId = part.id;
        o.primaryType = part.type;
        o.modifiedPrice = part.salePrice - part.oldPrice;

        expenseSheet.sparePartsExpense.push(o);
      });

      return;
    }

    // 服务项目
    if(fieldName === 'serviceIterm'){
      value.forEach(service => {
        let o = {};
        o.id = service.id;
        o.taskId = form.id;
        o.name = service.name;
        o.number = parseInt(service.num || 0);
        o.type = '服务';
        o.salePrice = service.salePrice;
        o.outPrice = service.costPrice;
        o.unit = service.unit;
        o.primaryId = service.id;
        o.primaryType = service.type;
        o.modifiedPrice = service.salePrice - service.oldPrice;
        o.serialNumber = service.serialNumber || '';

        expenseSheet.serviceExpense.push(o);
      });

      return;
    }

    if(fieldName === 'receiptAttachment'){
      // 拼附件和回执附件
      task.attachment = (value || []).map(a => {
        a.receipt = true;
        return a;
      })

      return;
    }

    if (field.formType === 'address' && !field.isSystem) {
      let all = [value.province, value.city, value.dist, value.address].filter(str => !!str).join('');

      value = {
        ...value,
      };

      all ? value.all = all : '';

    }
    
    task.attribute[fieldName] = value;
  });

  return {
    expenseSheet,
    task
  };
}

/** 
* @description 将工单对象转成form表单，用于初始化表单 
*/
export function packToForm(fields, data) {
  let { task, expenseSheet } = data;
  
  // 回执备件、服务项目、折扣信息
  let {
    discountExpense = {},
    sparePartsExpense = [],
    serviceExpense = []
  } = expenseSheet;

  const disExpense = discountExpense?.salePrice || 0;

  fields.forEach(field => {
    let { fieldName } = field;

    // 备件
    if(fieldName === 'sparepart') {
      sparePartsExpense.map(part => {
        part.id = part.primaryId;
        part.type = part.primaryType;
        part.oldPrice = part.salePrice;
      });

      task.attribute[fieldName] = sparePartsExpense || [];
      return;
    }

    // 服务项目
    if(fieldName === 'serviceIterm') {
      serviceExpense.map(service => {
        service.id = service.primaryId;
        service.type = service.primaryType;
        service.oldPrice = service.salePrice;
      });

      task.attribute[fieldName] = serviceExpense || [];
      return;
    }

    if(fieldName === 'receiptAttachment') {
      // 分离附件和回执附件
      if (task.attachment.length) {
        task.attribute[fieldName] = task.attachment.filter(img => img.receipt);
      }
    }

  });

  return {
    id: task.id,
    disExpense,
    ...task.attribute
  };
}


