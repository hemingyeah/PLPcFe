export default class TableRow{
  constructor(data, options = {}){   
    let {subProp, rowKey} = options;
    let key = rowKey ? data[rowKey] : Math.random() * 100000 >> 0;
    let children = [];
    //提取子表格
    if(typeof subProp == 'string') children = data[subProp];
    if(typeof subProp == 'function') children = subProp(data);
    if(!Array.isArray(children)) children = [];
    
    this.key = key; //key值，用于确定rawData唯一性
    this.rawData = data; //原始数据
    this.expand = true; //是否展开子表格
    this.children = children.map(item => new TableRow(item, options)); //子表格数据
    this.selected = false; //是否被选中
  }

  get hasChildren(){
    return this.children.length > 0;
  }
}