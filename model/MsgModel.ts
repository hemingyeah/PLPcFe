class MsgModel<T> {
  public static SUCCESS: number = 0
  public static FAIL: number = 1
  
  public status: number | undefined = 0
  public message?: string = ''
	public data?: T | null = null
	
	public get succ(): boolean {
		return this.status === MsgModel.SUCCESS
	}
  
  constructor(status: number, message: string) 
	constructor(status: number, message: string, data: T)
	constructor(status?: number, message?: string, data?: T) {
		this.status = status
		this.message = message || ''
		this.data = data || null
	}
	
	public static succ(message: string): MsgModel<null>
	public static succ(message: string, data: any): MsgModel<any>
	public static succ(message: string, data?: any): MsgModel<any> {
    return new MsgModel(MsgModel.SUCCESS, message)
	}
	
	public static fail(message: string): MsgModel<null>
	public static fail(message: string, data: any): MsgModel<any>
	public static fail(message: string, data?: any): MsgModel<any> {
    return new MsgModel(MsgModel.FAIL, message, data)
	}
  
}

export default MsgModel