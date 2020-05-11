
export default {
  name: 'base-table-cell',
  props: {
    row: Object,
    column: Object
  },
  render(h){
    let column = this.column;
    if(null == column) return;

    let field = column.field;
    
    let data = {
      'class': 'base-table-cell',
      domProps: {}
    };
    let vnode = this.row[field];

    if(typeof column.template == 'function'){
      data.domProps.innerHTML = column.template(this.row, field);
    }

    //如果提供render函数则完全由render函数决定内容
    if(typeof column.render == 'function'){
      vnode = column.render(h, this.row, field);
    }

    let children = Array.isArray(vnode) ? vnode : [vnode];
    return h('div', data, children);
  }
}