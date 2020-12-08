import Field from '@model/entity/Field'

interface Column {
  // 是否显示
  bool?: boolean
  // 导出别名
  exportAlias?: string
  // 是否导出
  export?: boolean
  // 字段
  field?: string
  // 固定列
  fixed?: boolean | 'left' | 'right'
  // 分组用的
  group?: string
  id?: string | number
  // 描述文本
  label?: string
  // 最小宽度
  minWidth?: string | null
  // 宽
  width?: string | null | number
  // 是否显示，基本用于表格
  show?: boolean
  // 是否支持排序
  sortable?: boolean | string
}

export default Column
