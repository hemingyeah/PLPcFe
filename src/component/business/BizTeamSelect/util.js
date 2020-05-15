/** 获取定位元素 */
export function getReferenceEl(ref){
  if(ref instanceof HTMLElement) return ref;
  return (typeof ref == 'string' && ref.length > 0) ? document.querySelector(ref) : null;
}

/** 获取父元素 */
export function getParentEl(parent){
  if(parent instanceof HTMLElement) return parent;

  if(typeof parent == 'string' && parent.length > 0) {
    let el = document.body.querySelector(parent);
    if(null != el) return el;
  }

  return document.body;
}