import _ from 'lodash';

/** 
 * @description 根据工时记录设置确定最终自定义字段
 */
function packFields(fields, config) {
  let _fields = _.cloneDeep(fields);
  let newFields = [];

  _fields.forEach(field => {

    // 备注字段前增加行程距离
    if (field.formType == 'text') {
      newFields.push({
        displayName: '行程距离(KM)',
        fieldName: 'distance',
        formType: 'number',
        enabled: config.distanceStatis ? 1 : 0
      }, {
        ...field
      }, )
    }

    // 在开始时间，结速时间后加位置
    else if (field.formType == 'datetime') {
      if (field.fieldName == 'startTime' && config.autoLocation) {
        newFields.push({
          ...field,
          minWidth: '160px',
        }, {
          displayName: '位置',
          fieldName: 'startAddress',
          formType: 'number',
          enabled: config.distanceStatis ? 1 : 0,
          showTooltip:true
        })

      } else {
        newFields.push({
          ...field,
          minWidth: '160px',
        }, {
          displayName: '位置',
          fieldName: 'endAddress',
          formType: 'number',
          enabled: config.distanceStatis ? 1 : 0,
          showTooltip:true
        })
      }

    }
    // 用时时间（H）
    else if (field.fieldName === 'usedTime') {
      field.displayName = `${field.displayName}(H)`;
    } else {
      // 过滤掉附件
      if(field.formType !== 'attachment'){
        newFields.push(field);
      }
    }
  })

  return newFields;
}

/** 
 * @description 将工时记录自定义字段转成列表所需显示
 */
function toTableFields(fields, config) {

  let tableFields = packFields(fields, config);

  return [
    ...tableFields,
    {
      displayName: '操作人',
      fieldName: 'operatorName',
      minWidth: '80px',
      enabled: 1
    },
    {
      displayName: '操作时间',
      fieldName: 'operateTime',
      minWidth: '160px',
      enabled: 1
    }
  ];
}

/** 
 * @description 自定义字段特殊处理
 */
function packCustomFields(fields) {
  let newCard = fields.filter(i=>{
    if(i.formType !== 'attachment'){
      if(i.formType == 'datetime'){
        i.minWidth = '160px' ;
      }
      if(i.formType == 'related_task'){
        i.minWidth = '160px' ;
        i.showTooltip = true ;
      }
               
      return !i.isHidden && i.isVisible 
    }
  }) 
  return newCard
}

const fieldUtil = {
  packFields,
  toTableFields,
  packCustomFields
}

export default fieldUtil;