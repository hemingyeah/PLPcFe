import _ from 'lodash';

/** 
 * @description 根据工时记录设置确定最终自定义字段
 */
function packFields(fields, config){
  let _fields = _.cloneDeep(fields);
  let newFields = [];

  _fields.forEach(field => {

    // 备注字段前增加行程距离、位置
    if (field.fieldName === 'remark') {
      newFields.push({
        displayName: '行程距离(KM)',
        fieldName: 'distance',
        formType: 'number',
        enabled: config.distanceStatis ? 1 : 0
      }, {
        displayName: '位置',
        fieldName: 'location',
        minWidth: '80px',
        enabled: config.autoLocation ? 1 : 0
      })
    }
    
    // 用时时间（H）
    if (field.fieldName === 'usedTime') {
      field.displayName = `${field.displayName}(H)`;
      field.placeHolder = '[结束时间]-[开始时间]';
      field.disabled = true;
    } 
    
    // 设置日期时间字段的列宽以及placeholder
    if (field.formType === 'datetime') {
      field.minWidth = '160px';

      if (field.fieldName == 'startTime') field.placeHolder = '请选择开始时间';
      if (field.fieldName == 'endTime') field.placeHolder = '请选择结束时间';
    }

    newFields.push(field);
  })

  return newFields;
}

/** 
 * @description 将工时记录自定义字段转成列表所需显示
 */
function toTableFields(fields, config){
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
    },
    {
      displayName: '操作',
      fieldName: 'action',
      minWidth: '140px',
      enabled: 1
    }
  ];
}

/** 
 * @description 将工时记录自定义字段转成新建、编辑所需表单字段
 */
function toFormFields(fields, config){
  let formFields = packFields(fields, config);

  return formFields.filter(field => field.fieldName != 'location');
}

/** 
 * @description 将移动端生产的数据转成详情所需展示字段
 */
function toMobileFields(fields, config){
  let _fields = _.cloneDeep(fields);
  let newFields = [];

  let remark = _fields.filter(field => field.fieldName === 'remark')[0] || {};
  let attachment = _fields.filter(field => field.fieldName === 'attachment')[0] || {};

  _fields.forEach(field => {
    let { fieldName } = field;

    // 在开始时间后加位置、备注、附件字段
    if (fieldName === 'startTime') {
      newFields.push({
        ...field
      }, {
        displayName: '位置',
        fieldName: 'startAddress',
        formType: 'number',
        enabled: config.autoLocation ? 1 : 0
      }, {
        ...remark,
        fieldName: 'startRemark'
      }, {
        ...attachment,
        fieldName: 'startAttachment'
      })

    }
    // 在结束时间后加位置、备注、附件字段
    else if (fieldName === 'endTime') {
      newFields.push({
        ...field
      }, {
        displayName: '位置',
        fieldName: 'endAddress',
        formType: 'number',
        enabled: config.autoLocation ? 1 : 0
      }, {
        ...remark,
        fieldName: 'endRemark'
      }, {
        ...attachment,
        fieldName: 'endAttachment'
      })

    } 
    // 用时时间
    else if (fieldName === 'usedTime') {
      newFields.push({
        ...field,
        displayName: `${field.displayName}(H)`
      })
    }
    // 用时类别
    else if (fieldName === 'usedTimeType') {
      newFields.push(field);
    }
  })

  // 行程距离
  newFields.push({
    displayName: '行程距离(KM)',
    fieldName: 'distance',
    enabled: config.distanceStatis ? 1 : 0
  })

  return newFields;
}

const fieldUtil = {
  packFields,
  toTableFields,
  toFormFields,
  toMobileFields
}

export default fieldUtil;