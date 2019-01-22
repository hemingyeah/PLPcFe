import {getScrollBarWidth} from '@src/util/dom'

/** 补全列宽 */
export function computeColumnWidth(columns, total, ctx){
  // let maxTotal = 0;
  // columns.forEach(col => {
  //   if(typeof col.width == 'number') {
  //     maxTotal += col.width;
  //   } else {
  //     maxTotal += 120;
  //   }
  // })
  // if(maxTotal > total) {
  //   total = maxTotal;
  // }
  // console.log(ctx.$parent)
  // console.log(document);
  // console.log(ctx.$root)
  // console.log(window.parent)

  let scrollBarWidth = 0;
  if(ctx.bodyHeight >= 0) scrollBarWidth = getScrollBarWidth();

  total -= scrollBarWidth;

  let colWidths = [];
  let averageSum = columns.length; //需均分列总数
  
  //初始化所有列宽
  colWidths.length = columns.length;

  //先确定固定宽度的列
  for(let i = 0; i < columns.length; i++){
    let col = columns[i];

    //目前只支持数字
    if(typeof col.width == 'number'){
      let width = col.width;
      if(!isNaN(col.width) && isFinite(width) && width >= 0) {
        let colWidth = Math.floor(width);
        colWidths[i] = colWidth;
        total -= colWidth;
        averageSum--;
      }
    }
  }
  //平分剩余宽度
  let averageWidth = Math.floor(total / averageSum);
  //除非知道列宽，否则最小宽度为120px
  if(averageWidth < 120) averageWidth = 120;

  let surplusWidth = total - averageWidth * averageSum;
  if(surplusWidth < 0) surplusWidth = 0;

  //为每个列赋值
  for(let i = 0; i < columns.length; i++){
    if(typeof colWidths[i] == 'undefined'){
      colWidths[i] = averageWidth;
    }
  }

  //剩余宽度赋给最后一列
  if(surplusWidth > 0){
    colWidths[colWidths.length - 1] += surplusWidth;
  }

  return colWidths;
}