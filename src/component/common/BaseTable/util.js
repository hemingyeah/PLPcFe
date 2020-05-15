import {getScrollBarWidth} from '@src/util/dom'

/** 补全列宽 */
export function computeColumnWidth(columns, width, ctx){
  let scrollBarWidth = 0;
  if(ctx.bodyHeight >= 0) scrollBarWidth = getScrollBarWidth();

  let total = width - scrollBarWidth;
  let averageSum = columns.length; // 需均分列总数

  // 先剔除固定宽度的列
  for(let i = 0; i < columns.length; i++){
    let col = columns[i];

    // 目前只支持数字
    if(typeof col.width == 'number' && !col.isAuto){
      total -= col.width;
      averageSum--;
    }
  }

  // 平分剩余宽度
  let averageWidth = Math.floor(total / averageSum);
  // 除非知道列宽，否则最小宽度为120px
  if(averageWidth < 120) averageWidth = 120;

  let surplusWidth = total - averageWidth * averageSum;
  if(surplusWidth < 0) surplusWidth = 0;

  // 为每个没有指定宽度的列赋值
  for(let i = 0; i < columns.length; i++){
    let col = columns[i]
    if(col.width == 'auto' || col.isAuto){
      col.width = averageWidth;
    }
  }

  // 剩余宽度赋给最后一列
  if(surplusWidth > 0){
    let lastColumn = columns[columns.length - 1];
    if(typeof lastColumn.width == 'number') {
      lastColumn.width += surplusWidth
    }
  }
  return columns;
}