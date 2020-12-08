import OperatorEnum from '@model/types/OperatorEnum'

/**
 * 自定义字段查询条件
*/
class Condition {
  // 操作符
  public operator: OperatorEnum | null = null
  // 属性名
  public property: string = ''
  // 一般情况的Value
  public value?: string = ''
  // in操作符的Value
  public inValue?: object[] = []
  // 数字操作符的Value
  public numberValue?: number = 0
  // between操作符的Value1
  public betweenValue1?: string = ''
  // between操作符的Value2
  public betweenValue2?: string = ''
  // 是否是JOSN字段查询
  public isJsonCondition?: boolean = true
  // JSON字段名
  public jsonDataField?: string = 'attribute'
  // 属性中文名
  public fieldNameCN?: string = ''

  public setBetweenValue(betweenValue1: string, betweenValue2: string): void {
    this.betweenValue1 = betweenValue1
    this.betweenValue2 =betweenValue2
  }
  public setJsonDataField(jsonDataField: string): void {
    this.isJsonCondition = true
    this.jsonDataField = jsonDataField
  }
}

export default Condition