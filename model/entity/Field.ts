interface Field {
  /**
   * 字段ID
   */
  fieldId?: string
  
  // 租户id
  tenantId?: string
  
  // 表名
  tableName?: string
  
  /**
   * 是否系统字段
  */
  isSystem?: number
  
  /**
   * 字段名称
  */
  fieldName: string
  
  /**
   * 显示名称
  */
  displayName?: string
  
  /**
   * 表单显示类型
   * 数据类型:label标签 text 单行文本 textarea 多行文本 editor 编辑器 box 选项 datetime 日期 number 数字 user员工email邮箱phone手机号mobile电话
  */
  formType: string
  
  /**
   * 默认值
  */
  defaultValue?: string | null
  
  /**
   * 是否允许为空
  */
  isNull?: number
  
  /**
   * 是否表单验证
  */
  isValidate?: number
  
  /**
   * 是否 用于搜索
  */
  isSearch?: number
  
  /**
   * 是否添加数据时显示
  */
  isAdd?: number
  /**
   * 是否逻辑删除
  */
  isDelete?: number
  
  /**
   * 是否只读
  */
  isReadonly?: number
  
  /**
   * 输入提示信息
  */
  placeHolder?: string | null
  
  /**
   * 表内排序
  */
  orderId?: number | null | undefined
  
  /**
   * table中文名称
  */
  tableChsName?: string
  
  /* 是否是实例数据 */
  isGuideData?: boolean
  
  /* 用户向导有关的 */
  guideProfessions?: any[]
  
  // 自增Id
  iid?: string
  
  id?: string
  
  /**
   * 设置信息，保存预制列表等数据
  */
  setting?: Map<string, object> | any
  
  /** 
   * 是否启用
  */
  enabled?: number

}

export default Field