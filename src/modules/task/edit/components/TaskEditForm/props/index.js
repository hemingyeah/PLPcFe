export default {
  /* 字段列表 */
  fields: {
    type: Array,
    default: () => []
  },
  /* 状态数据 */
  state: {
    type: Object,
    default: () => ({})
  },
  /* 工单类型 */
  types: {
    type: Array,
    default: () => []
  },
  task: {
    type: Object,
    default: () => ({})
  },
  /* url地址参数数据 */
  urlParams: {
    type: Object,
    default: () => ({})
  },
  /* 值数据 */
  value: {
    type: Object,
    required: true,
    default: () => ({})
  },
}