/**
 * 响应结果包装类
 *
 * @param <T> 结果类型
 */
class Result<T> {
  
  public static SUCCESS: number = 0
  public static FAIL: number = 1
  
  // 是否成功
  public success: boolean = false
  
  // 编码
  public code: number = 1
  
  // 信息
  public message: string = ''
  
  // 返回数据
  public result: T
  
  constructor(code: number, message: string, success: boolean, result: T) {
    this.success = success
    this.code = code
    this.message = message
    this.result = result
  }
}

export default Result
