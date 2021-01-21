import _ from 'lodash';

export const flowRules = [{
  value: 'allot',
  label: '指派'
}, {
  value: 'accept',
  label: '接受'
}, {
  value: 'start',
  label: '开始'
}, {
  value: 'finish',
  label: '完成'
}, {
  value: 'cost',
  label: '结算'
}, {
  value: 'review',
  label: '回访'
}, {
  value: 'close',
  label: '关闭'
}]
export const flowState = [{
  value: 'created',
  label: '待指派'
}, {
  value: 'allocated',
  label: '已指派'
}, {
  value: 'accepted',
  label: '已接受'
}, {
  value: 'processing',
  label: '进行中'
}, {
  value: 'finished',
  label: '已完成'
}, {
  value: 'costed',
  label: '已结算'
}]
export const flowMapState = {
  created:[{ // 待指派
    value: 'allot',
    label: '指派'
  }],
  allocated:[{// 已指派
    value: 'accept',
    label: '接受'
  }],
  accepted:[{// 已接受
    value: 'start',
    label: '开始'
  }],
  processing:[{// 进行中
    value: 'finish',
    label: '完成'
  }],
  finished:[{// 已完成
    value: 'cost',
    label: '结算'
  }],
  costed:flowRules, // 已结算
}
export const getFlowRuleOptions = (keys) => {
  if(Array.isArray(keys)){
    if(keys.length === 0){
      return flowRules
    }
    let option = [];
    keys.forEach(item=>{
      let values = flowMapState[item] || [];
      option.push(...values)
    });
    // return _.uniqBy(option, 'value')
    return option
  } else if(keys){
    return flowMapState[keys] || []
  } 
  return flowRules
    

}