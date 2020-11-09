/* class */
import ValidateResult from './ValidateResult'
/* enum */
import SignOperatorEnum from './SignOperatorEnum'

type RegExpExecResult = RegExpExecArray | null | any

/** 
 * @description 通用验证
 * @param {RegExp} reg 正则
 * @param {String} str 验证的字符串
 * @param {String} errorMessage 错误信息
 * @param {Boolean} showMathString 是否显示匹配的字符串
*/
function commonValidate(reg: RegExp, str: string, errorMessage: string, showMathString: boolean = false): ValidateResult {
  let error: RegExpExecResult = reg.exec(str)
  // 验证成功会返回 null
  if (error === null) return ValidateResult.succ()
  // 匹配的子符串
  let mathString: string = error[0]
  
  return ValidateResult.fail(`${errorMessage} ${showMathString ? mathString : ''}`, error.index, mathString)
}

/** 
 * @description 验证表达式的正确性
 * 基本用正则，先 test 验证时因为速度较快，后面用 exec 速度稍慢，但是可以获得更多信息
 * FIXME: /g 匹配有问题，没深究，应该可临时解决(暂未解决)
 * @param {String} str 验证的字符串
 * @param {String} defaultNumber 默认数字，字段名字替代的
*/
export default function validate(str: string, defaultNumber?: number | string) {
  // 连续运算符
  const ContinuousReg = /[\+\-\*\/]{2,}/
  if (ContinuousReg.test(str) ) {
    return commonValidate(ContinuousReg, str, '运算符不能连续出现，请在中间插入运算对象')
  }
  
  // 验证连续的字段名
  const ContinuousFieldsReg = new RegExp(`[${defaultNumber}]{2,}`)
  if (ContinuousFieldsReg.test(str)) {
    // FIXME: 下面这行代码虽然看起来无意义，但是不要去除, 有问题可以解开或者注释 或 @月初
    // ContinuousFieldsReg.test(str)
    return commonValidate(ContinuousFieldsReg, str, '运算对象不能连续出现, 请在中间插入运算符号')
  }
  
  // 空括号
  const EmptyBracketReg = /\(\)/
  if (EmptyBracketReg.test(str)) {
    return commonValidate(EmptyBracketReg, str, '括号中内容为空，请插入运算元素')
  }
  
  // 左括号( 后面是运算符 
  const LeftBracketAfterWithFormulaReg = /\([\+\-\*\/]/
  if (LeftBracketAfterWithFormulaReg.test(str)) {
    return commonValidate(LeftBracketAfterWithFormulaReg, str, '左括号右侧不能和运算符号连续')
  }
  
  // 右括号 ) 前面是运算符
  const RightBracketBeforeWithFormulaReg = /[\+\-\*\/]\)/
  if (RightBracketBeforeWithFormulaReg.test(str)) {
    return commonValidate(RightBracketBeforeWithFormulaReg, str, '右括号左侧不能和运算符号连续')
  }
  
  // 左括号 ( 前面不是运算符
  const LeftBracketBeforeReg = /[^\+\-\*\/\()]\(/
  if (LeftBracketBeforeReg.test(str) && str[0] != '(') {
    return commonValidate(LeftBracketBeforeReg, str, '左括号前面必须是运算符号')
  }
  
  // 右括号 ) 后面不是运算符
  const RightBracketAfterReg = /\)[^\+\-\*\/\)]/
  if (RightBracketAfterReg.test(str)) {
    return commonValidate(RightBracketAfterReg, str, '右括号后面必须是运算符号')
  }
  
  // 长度为1 且 是符号
  // @ts-ignore
  if (str.length === 1 && ['+', '-', '*', '/', '(', ')'].includes(str)) {
    return ValidateResult.fail('公式不合规，请修正', 0, str)
  }

  // 运算符开头
  const startWithReg = /^[\*\/]/
  if (startWithReg.test(str)) {
    return commonValidate(startWithReg, str, '运算符号不能开头')
  }

  // 运算符结尾
  const endWithReg = /[\*\/\+\-\(]$/
  if (endWithReg.test(str)) {
    return commonValidate(endWithReg, str, '运算符号不能结尾')
  }
  
  /** 错误情况，括号不配对 */
  // 括号堆栈信息
  let leftBracketStack = []
  // 左括号索引
  let leftBracketIndex = 0
  
  for (let i = 0; i < str.length; i++) {
    let item = str.charAt(i)
    // 左括号
    if (SignOperatorEnum.LeftBracket === item) {
      leftBracketStack.push(SignOperatorEnum.LeftBracket)
      leftBracketIndex = i
    }
    // 右括号
    else if (SignOperatorEnum.RightBracket === item) {
      // 如果堆栈中存在左括号 则删除
      if (leftBracketStack.length > 0) {
        leftBracketStack.pop()
      } else {
        // return ValidateResult.fail(`没有匹配的左括号 ${SignOperatorEnum.LeftBracket}`, i, SignOperatorEnum.RightBracket)
        return ValidateResult.fail('括号不匹配', i, SignOperatorEnum.RightBracket)
      }
    }
  }
  // 如果堆栈中存在左括号，则说明没有匹配的右括号
  if (leftBracketStack.length > 0) {
    // return ValidateResult.fail(`没有匹配的右括号 ${SignOperatorEnum.RightBracket}`, leftBracketIndex, SignOperatorEnum.LeftBracket)
    return ValidateResult.fail('括号不匹配', leftBracketIndex, SignOperatorEnum.LeftBracket)
  }
  
  return ValidateResult.succ()
}