import OperatorEnum from '@model/enum/OperatorEnum'

/* 自定义字段查询条件 */
interface Condition {
  // 操作符
  operator: OperatorEnum
  // 属性名
  property: string
  // 一般情况的Value
  value: string
  // in操作符的Value
  inValue: object[]
  // 数字操作符的Value
  numberValue: number
  // between操作符的Value1
  betweenValue1: string
  // between操作符的Value2
  betweenValue2: string
  // 是否是JOSN字段查询
  isJsonCondition: boolean
  // JSON字段名
  jsonDataField: string;
  // 属性中文名
  fieldNameCN: string
}

export default Condition