/* class */
import ValidateResult from './ValidateResult'
/* components */
// @ts-ignore
import draggable from 'vuedraggable'
/* enum */
import SignOperatorEnum from './SignOperatorEnum'
/* util */
import * as MathUtil from 'mathjs'
import validate from './validate'
import Platform from '@src/platform'
/* vue */
import { Vue, Component, Prop } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import './BaseCalculationFormula.scss'

/* 计算公式每项 */
class CalculationFormulaItem {
  // 值
  value: string = ''
  // 是否为操作符
  isOperator: boolean = false
  // 当前项是否是错误的
  isError: boolean = false
  
  constructor(value: string, isOperator: boolean, isError?: boolean) {
    this.value = value || ''
    this.isOperator = isOperator || false
    this.isError = isError || false
  }
}

@Component({ 
  name: 'base-calculation-formula',
  components: { draggable }
})

export default class BaseCalculationFormula extends Vue {

  /* 支持运算的字段列表 */
  @Prop() fieldNames: string[] | undefined
  
  /* 计算公式数组 */
  private calculationFormula: CalculationFormulaItem[] = []
  /* 运算字段对象 */
  private calculationFields: string[] = ['字段1', '字段2', '字段3']
  /* 默认数值 用来代替字段名字 */
  private defaultNumber: number | string = 0
  /* 错误提示 */
  private errorMessage: string = '公式不合规，请修正'
  /* 计算公式符号列表 (暂不支持自定义，所以先写死了) */
  private operatorList: SignOperatorEnum[] = [
    SignOperatorEnum.Add,
    SignOperatorEnum.Subtract,
    SignOperatorEnum.Multiply,
    SignOperatorEnum.Divide,
    SignOperatorEnum.LeftBracket,
    SignOperatorEnum.RightBracket
  ]
  /* 显示状态 */
  private show: boolean = false
  
  /* 扁平化的计算公式数组 */
  get calculationFormulaFlat(): string[] {
    return this.calculationFormula.map((item: CalculationFormulaItem) => item.value)
  }
  
  /** 
   * @description 格式化的计算公式字符串
   * 操作符 替换为 0，是因为字段名字如果设置为操作符会影响判断
  */
  get calculationFormulaFormatted() {
    return (
      this.calculationFormula
        .map((item: CalculationFormulaItem) => item.isOperator ? item.value : this.defaultNumber)
        .join('')
    )
  }
  
  /** 
   * @description 取消
  */
  private cancel(): void {
    this.show = false
  }
  
  /** 
   * @description 确定
  */
  private confirm(): void {
    let result = validate(this.calculationFormulaFormatted, this.defaultNumber)
    let isSuccess = result.isSuccess
    
    // 失败
    if (!isSuccess) {
      this.setErrorMessage(result)
    }
    
    // 成功 do some things...
    console.log('success', result)
    // 解析值
    try {
      console.log(MathUtil.evaluate(this.calculationFormulaFormatted))
    } catch (error) {
      console.error('MathUtil.evaluate -> error', error)
    }

  }
  
  /** 
   * @description 操作符号点击
   * @param {SignOperatorEnum} operator 操作符
  */
  private handleOperatorClick(operator: SignOperatorEnum): void {
    this.calculationFormula.push(new CalculationFormulaItem(operator, true))
  }
  
  /** 
   * @description 运算字段点击
   * @param {SignOperatorEnum} operator 操作符
  */
  private handleFieldClick(fieldName: string): void {
    this.calculationFormula.push(new CalculationFormulaItem(fieldName, false))
  }
  
  /**
   * @description 显示
  */
  private open(): void {
    this.show = true
  }
  
  /**
   * @description 重置
  */
  private reset(): void {
    this.calculationFormula = []
  }
  
  /** 
   * @description 设置错误信息数据
  */
  private setErrorMessage(validate: ValidateResult): void {
    let { errorMessage, errorData, errorIndex } = validate
    let errorDataLength = (errorData && errorData.length) || 0
    
    // 错误提示
    Platform.alert(errorMessage)
    
    // 设置错误信息
    let startIndex = errorIndex || 0
    for (let i = 0; i < errorDataLength; i++) {
      this.calculationFormula[startIndex + i].isError = true
    }
  }
  
  /** 
   * @description 渲染运算符号列表
  */
  private renderOperator() {
    return (
      <div class='calculation-formula-operators'>
        运算符号
        {
          this.operatorList.map((operator: SignOperatorEnum) => {
            return (
            <span onClick={() => this.handleOperatorClick(operator)}>
              {operator}
            </span>
            )
          })
        }
      </div>
    )
  }
  
  /** 
   * @description 渲染运算对象
  */
  private renderField() {
    return (
      <div class='calculation-formula-fields'>
        运算对象
        {
          this.calculationFields.map((fieldName: string) => {
            return (
            <span onClick={() => this.handleFieldClick(fieldName)}>
              {fieldName}
            </span>
            )
          })
        }
      </div>
    )
  }
  
  /** 
   * @description 渲染计算公式
  */
  private renderCalculationFormula() {
    return (
      <div class='calculation-formula-block'>
        计算公式
        <draggable 
          class='nested-draggable'
          tag='div'
          list={ this.calculationFormula }
        >
          {
            this.calculationFormula.map((item: any) => {
              return (
                <span class={{ error: item.isError }}>
                  {item.value}
                </span>
              )
            })
          }
        </draggable>
      </div>
    )
  }
  
  render(h: CreateElement) {
    const attrs = {
      class: 'calculation-formula-modal',
      props: {
        show: this.show,
        title: '设置计算公式'
      },
      on: {
        'update:show': (val: boolean) => {
          this.show = val
        }
      }
    }
    
    return (
      <base-modal {...attrs}>
        {this.renderCalculationFormula()}
        {this.renderField()}
        {this.renderOperator()}
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" onClick={this.cancel}>取消</el-button>
          <el-button type="warning" onClick={this.reset}>重置</el-button>
          <el-button type="primary" onClick={this.confirm}>确定</el-button>
        </div>
      </base-modal>
    )
  }
  
}

