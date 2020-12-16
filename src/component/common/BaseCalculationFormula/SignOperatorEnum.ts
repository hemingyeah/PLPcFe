/* 暂时只在组件内使用，如需在其他地方，须迁移至外层 */

/* 计算公式符号枚举 */
enum SignOperatorEnum {
  // 加
  Add = '+',
  // 减
  Subtract = '-',
  // 乘
  Multiply = '*',
  // 除
  Divide = '/',
  // 左括号
  LeftBracket = '(',
  // 右括号
  RightBracket = ')',
}

export default SignOperatorEnum