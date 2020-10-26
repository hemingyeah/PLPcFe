/* class */
import ValidateResult from './ValidateResult'
/* enum */
import SignOperatorEnum from './SignOperatorEnum'

type RegExpExecResult = RegExpExecArray | null | any

/** 
 * @description 通用验证
*/
function commonValidate(reg: RegExp, str: string, errorMessage: string): ValidateResult {
  let error: RegExpExecResult = reg.exec(str)
  // 验证成功会返回 null
  if (error === null) return ValidateResult.succ()
  // 匹配的子符串
  let mathString: string = error[0]
  
  return ValidateResult.fail(`${errorMessage} ${mathString}`, error.index, mathString)
}

/** 
 * @description 验证表达式的正确性
 * 基本用正则，先 test 验证时因为速度较快，后面用 exec 速度稍慢，但是可以获得更多信息
*/
export default function validate(str: string) {
  // 验证是否为空
  if (!str) {
    return ValidateResult.fail('计算表达式不能为空')
  }
  
  // 连续运算符
  const ContinuousReg = /[\+\-\*\/]{2,}/
  if (ContinuousReg.test(str) ){
    return commonValidate(ContinuousReg, str, '重复的运算符, 运算符不能连接在一起')
  }

  // 空括号
  const EmptyBracketReg = /\(\)/
  if (ContinuousReg.test(str) ){
    return commonValidate(EmptyBracketReg, str, '括号内容为空')
  }
  
  // 左括号( 后面是运算符 
  const LeftBracketAfterWithFormulaReg = /\([\+\-\*\/]/
  if (LeftBracketAfterWithFormulaReg.test(str)){
    return commonValidate(LeftBracketAfterWithFormulaReg, str, '左括号右侧不能和运算符号一起，须间隔显示')
  }
  
  // 右括号 ) 前面是运算符
  const RightBracketBeforeWithFormulaReg = /[\+\-\*\/]\)/
  if (RightBracketBeforeWithFormulaReg.test(str)){
    return commonValidate(RightBracketBeforeWithFormulaReg, str, '右括号左侧不能和运算符号一起，须间隔显示')
  }
  
  // 左括号 ( 前面不是运算符
  const LeftBracketBeforeReg = /[^\+\-\*\/\()]\(/
  if (/[^\+\-\*\/\()]\(/.test(str) && str[0] != '('){
    return commonValidate(LeftBracketBeforeReg, str, '括号须和表达式一起使用')
  }
  
  // 右括号 ) 后面不是运算符
  const RightBracketAfterReg = /\)[^\+\-\*\/\)]/
  if (RightBracketAfterReg.test(str)){
    return commonValidate(RightBracketAfterReg, str, '括号须和表达式一起使用')
  }
  
  // 长度为1 且 是符号
  // @ts-ignore
  if (str.length === 1 && ['+', '-', '*', '/', '(', ')'].includes(str)) {
    return ValidateResult.fail(`运算符须和运算对象一起使用 ${str}`, 0, str)
  }
  
  // 没有公式 运算符号
  const FormulaReg = /[\(\)\+\-\*\/]{1,}/g
  if (FormulaReg.test(str)) {
    // FIXME: 下面这行代码虽然看起来无意义，但是不要去除, 有问题可以解开或者注释
    // FormulaReg.test(str)
    return commonValidate(FormulaReg, str, '没有选择运算符号或运算符号没有运算字段一起使用')
  }
  
  /** 错误情况，括号不配对 */
  // 括号堆栈信息
  let leftBracketStack = []
  // 左括号索引
  let leftBracketIndex = 0
  
  for(let i = 0; i < str.length; i++){
    let item = str.charAt(i)
    // 左括号
    if(SignOperatorEnum.LeftBracket === item){
      leftBracketStack.push(SignOperatorEnum.LeftBracket)
      leftBracketIndex = i
    }
    // 右括号
    else if(SignOperatorEnum.RightBracket === item){
      // 如果堆栈中存在左括号 则删除
      if(leftBracketStack.length > 0){
        leftBracketStack.pop()
      } else {
        return ValidateResult.fail(`没有匹配的左括号 ${SignOperatorEnum.LeftBracket}`, i, SignOperatorEnum.RightBracket)
      }
    }
  }
  // 如果堆栈中存在左括号，则说明没有匹配的右括号
  if(leftBracketStack.length > 0){
    return ValidateResult.fail(`没有匹配的右括号 ${SignOperatorEnum.RightBracket}`, leftBracketIndex, SignOperatorEnum.LeftBracket)
  }
  
  return ValidateResult.succ()
}