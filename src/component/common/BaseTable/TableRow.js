export default class TableRow{
  constructor(data, options = {}){   
    let {subProp, rowKey, parent} = options;
    let key = rowKey ? data[rowKey] : Math.random() * 100000 >> 0;    
    
    this.key = key; //key值，用于确定rawData唯一性
    this.rawData = data; //原始数据
    this.expand = true; //是否展开子表格
    this.children = this.getChildren(data, subProp).map(item => {
      let opt = {...options, ...{parent: this}};
      return TableRow.as(item, opt);

    }); //子表格数据
    this.selected = false; //是否被选中
    this.parent = parent;
    this.hover = false;
  }

  get hasChildren(){
    return this.children.length > 0;
  }

  //是否有父级
  get hasParent(){
    return !!this.parent;
  }

  static as(o, options){
    if(o instanceof TableRow) return o;

    return new TableRow(o, options)
  }

  getChildren(data, subProp){
    let children = [];
    //提取子表格
    if(typeof subProp == 'string') children = data[subProp];
    if(typeof subProp == 'function') children = subProp(data);
    if(!Array.isArray(children)) children = [];
  
    return children;
  }
}

