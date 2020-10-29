/**
 * 条件操作符枚举
 * 用于自定义字段查询
 */
enum OperatorEnum {
  gt = '>',
  lt = '<',
  ge = '>=',
  le = '<=',
  like = 'like',
  in = 'in',
  between = 'between',
  eq = '=',
  contain = 'contain',
  cascader = 'cascader',
  // 用户id搜索 (比如`property=createUser`表示的就是搜`createUser.userId`)
  user = 'user',
  // 地址条件搜索 (比如`property=userAddress`表示的就是搜`userAddress.address`,并且用的是正则表达式搜)
  location = 'location',
  address = 'address',
  notEq = '<>'
}

export default OperatorEnum