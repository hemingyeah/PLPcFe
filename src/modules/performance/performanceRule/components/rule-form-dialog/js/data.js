//生效条件 方式
const EFFECTIVE_TERM = [
  {
    label: '全部',
    value: 'all'
  },
  {
    label: '仅包含',
    value: 'baohan'
  },
  {
    label: '仅排除',
    value: 'paichu'
  }
]

//生效条件 类型
const TERM = [
  {
    label: '工单类型',
    value: 'templateId'
  },
  {
    label: '服务类型',
    value: 'serviceType'
  },
  {
    label: '服务内容',
    value: 'serviceContent'
  },
  {
    label: "自定义字段",
    value: "customField"
  }
]

//表单初始数据
const INIT_FORM_DATA = {
  prId: '',
  //工单名称
  prName: '',
  //规则说明
  description: '',
  //结算类型 计分or奖金
  rewardType: 'jifen',
  //奖金计算方式
  moneyType: 'lirun',
  //负责人奖励数值
  comPerson: '0',
  //协同人奖励数值
  assPerson: '0',
  //生效条件 方式
  screenType: 'all',
  //生效条件 类型
  settleType: '',
  //生效条件内容
  screenMsg: [],
  
  //工单类型
  taskType: null,
  //字段名
  fieldName: '',
  //字段显示
  filedDisplayName: '',
  //字段值
  fieldValue: ''
}

//奖金计算方式
const REWARD_TYPE = [
  {
    label: '毛利',
    value: 'lirun'
  },
  {
    label: '营收金额',
    value: 'shoujia'
  },
  {
    label: '数量',
    value: 'geshu'
  }
]
export default {
  EFFECTIVE_TERM,
  TERM,
  INIT_FORM_DATA,
  REWARD_TYPE
}