
import LoadMore from '@src/directive/loadmore'

function getSelectElement(el) {
  return el.querySelector(
    '.el-select-dropdown .el-select-dropdown__wrap'
  )
}

const ElSelectLoadmoreDirective = {
  bind(el, binding, vnode){
    const selectElement = getSelectElement(el)
    LoadMore.bind(selectElement, binding, vnode)
  },
  unbind(el){
    const selectElement = getSelectElement(el)
    LoadMore.unbind(selectElement)
  }
}

export default ElSelectLoadmoreDirective
