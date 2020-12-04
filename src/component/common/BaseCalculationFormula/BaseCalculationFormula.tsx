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
import * as _ from 'lodash'
/* vue */
import { Vue, Component, Prop, Emit } from 'vue-property-decorator'
import { CreateElement } from 'vue'
/* scss */
import './BaseCalculationFormula.scss'

/* 计算公式每项 */
class CalculationFormulaItem {
  // 名称
  name: string = ''
  // 值
  value: string = ''
  // 是否为操作符
  isOperator: boolean = false
  // 当前项是否是错误的
  isError: boolean = false
  // 当前项是否已被删除
  isDelete: boolean = false
  
  constructor(name: string, value: string, isOperator: boolean, isError?: boolean, isDelete?: boolean) {
    this.name = name || ''
    this.value = value || ''
    this.isOperator = isOperator || false
    this.isError = isError || false
    this.isDelete = isDelete || false
  }
}

@Component({ 
  name: 'base-calculation-formula',
  components: { draggable }
})
export default class BaseCalculationFormula extends Vue {

  /* 支持运算的字段列表 */
  @Prop({default: []}) calculationFields: Array<any> | undefined
  
  /* 计算公式数组 */
  private calculationFormula: CalculationFormulaItem[] = []
  /* 默认数值 用来代替字段名字 */
  private defaultNumber: number | string = 0
  /* 错误提示 */
  private errorMessage: string = ''
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

  @Emit('confirm')    
  private saveFormula() {
    return  _.cloneDeep(this.calculationFormula)
  }
  
  /** 
   * @description 确定
  */
  private confirm(): void {
    // 判断是否存在已删除的无效字段
    let invalidFields = this.calculationFormula.filter(item => item.isDelete);
    if (invalidFields.length) {
      this.errorMessage = '存在已删除或已隐藏的无效字段，请重新配置计算公式'
      return
    }

    let result = validate(this.calculationFormulaFormatted, this.defaultNumber)
    let isSuccess = result.isSuccess

    // 清空错误信息
    this.calculationFormula.map(item => item.isError = false)
    this.errorMessage = ''
    
    // 失败
    if (!isSuccess) {
      return this.setErrorMessage(result)
    }
    
    // 成功
    this.show = false
    this.saveFormula()
  }
  
  /** 
   * @description 操作符号点击
   * @param {SignOperatorEnum} operator 操作符
  */
  private handleOperatorClick(operator: SignOperatorEnum): void {
    this.calculationFormula.push(new CalculationFormulaItem(operator, operator, true))
  }
  
  /** 
   * @description 运算字段点击
   * @param {SignOperatorEnum} operator 操作符
  */
  private handleFieldClick(displayName: string, fieldName: string): void {
    this.calculationFormula.push(new CalculationFormulaItem(displayName, fieldName, false))
  }
  
  /**
   * @description 显示
  */
  private open(formula: []): void {
    this.calculationFormula = _.cloneDeep(formula)
    this.errorMessage = ''
    this.show = true
  }
  
  /**
   * @description 重置
  */
  private reset(): void {
    this.calculationFormula = []
  }

  /**
   * @description 删除
  */
  private delete(): void {
    this.calculationFormula.pop()
  }
  
  /** 
   * @description 设置错误信息数据
  */
  private setErrorMessage(validate: ValidateResult): void {
    let { errorMessage, errorData, errorIndex } = validate
    let errorDataLength = (errorData && errorData.length) || 0
    
    // 错误提示
    this.errorMessage = errorMessage || ''
    
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
        运算符号:
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
        <el-tooltip placement="top">
          <div slot="content">表单中已配置的【数字】类型的字段可以作为运算的对象</div>
          <i class="iconfont icon-question"></i>
        </el-tooltip>
        运算对象:
        {
          this.calculationFields && this.calculationFields.map(({ displayName, fieldName }) => {
            return (
            <span onClick={() => this.handleFieldClick(displayName, fieldName)}>
              {displayName}
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
        <div class='calculation-formula-content'>
          <div class='calculation-formula-title'>计算公式=</div>
          <draggable 
            class='nested-draggable'
            tag='div'
            list={ this.calculationFormula }
          >
            {
              this.calculationFormula.map((item: any) => {
                return (
                  <span class={{ operator: item.isOperator, delete: item.isDelete }}>
                    {item.name}
                  </span>
                )
              })
            }
          </draggable>
        </div>
        <div class='calculation-formula-action'>
          <span class='formula-remove-btn' onClick={this.delete}>
            <i class='iconfont icon-shanchu2'></i>
          </span>
          <span class='formula-clear-btn' onClick={this.reset}>清空</span>
        </div>
      </div>
    )
  }

  /** 
  * @description 渲染计算公式错误提示
  */
  private renderErrorMessage() {
    return this.errorMessage && (
      <div class='calculation-formula-error'>
        {this.errorMessage}
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
        {this.renderErrorMessage()}
        {this.renderField()}
        {this.renderOperator()}
        <div slot="footer" class="dialog-footer">
          <el-button type="ghost" onClick={this.cancel}>取消</el-button>
          <el-button type="primary" onClick={this.confirm}>保存</el-button>
        </div>
      </base-modal>
    )
  }
  
}

