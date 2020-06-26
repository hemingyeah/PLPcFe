/* config */
import * as CONFIG from '@src/component/form/config';

export default class TableColumn{
  constructor(options = {}){    
    let width = this.parseWidth(options.width)

    this.field = options.field;
    this.label = options.label;
    
    this.expandProp = options.expandProp;
    this.render = options.render;
    this.headRender = options.headRender;

    // 格式化值
    this.formatter = options.formatter;

    // 值可以为 true, false, 'important'
    // 值不为false时显示该列，值为important时会一直显示
    this.show = options.show == 'important' ? options.show : options.show !== false ;
    this.fixed = options.fixed;
    this.overflow = options.overflow;
    this.hover = false;

    this.type = 'column';
    this.width = width;
    this.isAuto = width == 'auto';
  }

  parseWidth(width){
    return typeof width == 'number' && !isNaN(width) && isFinite(width) && width > 0 
      ? Math.floor(width) 
      : 'auto'
  }

  static as(o){
    return o instanceof TableColumn ? o : new TableColumn(o);
  }
}

export class SelectionColumn extends TableColumn{
  constructor(){
    let options = {
      width: CONFIG.COL_SELECTION_WIDTH,
      field: 'table__selection',
      label: '选择框',
      show: true,
      fixed: 'left'
    }
    
    super(options);

    this.type = 'selection'
  }
}

export class PaddingColumn extends TableColumn{
  constructor(width){
    let options = {
      width,
      field: 'table__padding',
      label: '内边距',
      show: true
    }

    super(options);

    this.type = 'padding'
  }
}
