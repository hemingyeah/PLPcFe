/** 
* @description 将form对象转成客户对象，用于提交表单 
*/
export function packToReceipt(fields, form) {
  let expenseSheet = {
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
      value.forEach(item => item.taskId = form.id);
      expenseSheet.sparePartsExpense = value;
      return;
    }

    // 服务项目
    if(fieldName === 'serviceIterm'){
      value.forEach(item => item.taskId = form.id);
      expenseSheet.serviceExpense = value;
      return;
    }

    if(fieldName === 'receiptAttachment'){
      // 拼附件和回执附件
      task.attachment = value;
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
      sparePartsExpense.map(part => part.id = part.primaryId);
      task.attribute[fieldName] = sparePartsExpense;
      return;
    }

    // 服务项目
    if(fieldName === 'serviceIterm') {
      serviceExpense.map(service => service.id = service.primaryId);
      task.attribute[fieldName] = serviceExpense;
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


