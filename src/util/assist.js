/* 向上找到最近的指定组件 */
function findComponentUpward(context, componentName) {
  let parent = context.$parent;
  let name = parent.$options.name;

  while (parent && (!name || [componentName].indexOf(name) < 0)) {
    parent = parent.$parent;
    if (parent) name = parent.$options.name;
  }
  
  return parent
}

/* 由一个组件，向上找到所有的指定组件 */
function findComponentsUpward(context, componentName) {
  let parents = [];
  let parent = context.$parent;


  if(parent) {
    if(parent.$options.name == componentName) parents.push(parent);
    return parents.concat(findComponentsUpward(parent, componentName))
  }
  
  return []
}

/* 向下找到最近指定组件 */
function findComponentDownward(context, componentName) {
  const childrens = context?.$children
  let children = null
  
  if (!childrens || !childrens.length) return children
  
  for (const child of childrens) {
    // 判断当前的子元素 名字是否相同
    if(child.$options.name == componentName) {
      children = child
      break
    } else {
      // 递归判断 当前子元素的 子元素是否相等
      let isChild = findComponentDownward(child, componentName);
      if(isChild) {
        children = isChild
        break
      }
    }
  }
  
  return children
}

// 由一个组件，向下找到所有指定的组件
function findComponentsDownward(context, componentName) {
  return context.$children.reduce((components, child) => {
    if (child.$options.name === componentName) components.push(child);
    const foundChilds = findComponentsDownward(child, componentName);
    return components.concat(foundChilds);
  }, []);
}

/* 由一个组件，找到指定的兄弟组件 */
function findBrothersComponents(context, componentName, exceptMe = true) {
  let res = context.$parent.$children.filter(item => item.$options.name == componentName);

  let index = res.findIndex(item => item._uid == context._uid);
  if (exceptMe) res.slice(index, 1);

  return res;
}

/* 判断类型 */
function typeOf(obj) {
  const toString = Object.prototype.toString;
  const map = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object'
  };

  return map[toString.call(obj)];
}
/* 深度拷贝 */
function deepCopy(data) {
  let type = typeOf(data);
  let newData = null;

  if(type == 'array') {
    newData = [];

    for(let i = 0; i < data.length; i++) {
      newData.push(data[i])
    }
    return newData

  } else if(type == 'object') {
    newData = {};

    for(let i in data) {
      newData[i] = deepCopy(data[i]);
    }
    return newData

  }
  
  return data;
  
}

export {
  findComponentUpward,
  findComponentsUpward,
  findComponentDownward,
  findComponentsDownward,
  findBrothersComponents,
  typeOf,
  deepCopy
};