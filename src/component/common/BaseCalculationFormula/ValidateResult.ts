/* 错误索引 */
type ErrorIndex = number | null | undefined

/* 验证结果 */
class ValidateResult {
  public static SUCCESS: boolean = true
  public static FAIL: boolean = false
	
  errorIndex?: ErrorIndex = null
  errorMessage?: string
  errorData?: string = ''
  success: boolean = false
  
  public get isSuccess(): boolean {
		return this.success === ValidateResult.SUCCESS
	}
  
  constructor(success: boolean) 
  constructor(success: boolean, errorMessage: string) 
	constructor(success: boolean, errorMessage: string, errorIndex: ErrorIndex)
	constructor(success: boolean, errorMessage: string, errorIndex: ErrorIndex)
	constructor(success: boolean, errorMessage: string, errorIndex: ErrorIndex, errorData?: string)
	constructor(success?: boolean, errorMessage?: string, errorIndex?: ErrorIndex, errorData?: string) {
		this.success = Boolean(success)
		this.errorMessage = errorMessage || ''
    this.errorIndex = errorIndex || null
    this.errorData = errorData || ''
	}
	
	public static succ(): ValidateResult {
    return new ValidateResult(ValidateResult.SUCCESS)
	}
	
	public static fail(errorMessage: string): ValidateResult
	public static fail(errorMessage: string, errorIndex: ErrorIndex): ValidateResult
	public static fail(errorMessage: string, errorIndex: ErrorIndex, errorData: string): ValidateResult
	public static fail(errorMessage: string, errorIndex?: ErrorIndex, errorData?: string): ValidateResult {
    return new ValidateResult(ValidateResult.FAIL, errorMessage, errorIndex, errorData)
	}
}

export default ValidateResult