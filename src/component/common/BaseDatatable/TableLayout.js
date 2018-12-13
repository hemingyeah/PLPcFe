
/** 渲染表格头 */
export function renderHead(h, columns){
  return columns.map(col => 
    <th>
      {
        typeof col.headRender == 'function'
          ? col.headRender(h, col)
          : col.displayName
      }
    </th>
  )
}


