// 通用 设置属性
let settingProps = {
  field: {
    type: Object,
    default: () => ({})
  },
  fields: {
    type: Array,
    default: () => []
  },
  mode: {
    type: String,
    default: ''
  },
  setting: {
    type: Object,
    default: () => ({})
  }
}
// 通用 预览属性
let previewProps = {
  field: {
    type: Object,
    default: () => ({})
  },
  setting: {
    type: Object,
    default: () => ({})
  }
}
/** 
 * @depercated
 * @description 通用 视图属性 
*/
let viewProps = {
  field: {
    type: Object,
    default: () => ({})
  },
  value: {
    type: Array,
    default: () => []
  }
}

export {
  previewProps,
  settingProps,
  viewProps
}