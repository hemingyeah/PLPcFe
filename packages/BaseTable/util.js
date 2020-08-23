/**
 * 查询相同的row
 */
function findSameRow(row, target){
  let reslut = null;
  for(var i = 0; i < target.length; i++){
    if(target[i]._origin == row){
      reslut = target[i];
      break;
    }
  }
  return reslut;
}

let getScrollBarWidth = function(){  
  let el = document.createElement('div')
  let styles = {
    width: '100px',
    height: '100px',
    overflowY: 'scroll'
  };

  for (let i in styles) el.style[i] = styles[i];

  document.body.appendChild(el);
  let scrollbarWidth = el.offsetWidth - el.clientWidth;
  el.remove();

  //下次直接返回结果
  getScrollBarWidth = function(){
    return scrollbarWidth;
  }

  return scrollbarWidth;
}

function computeColumnWidth(columns, total, ctx){
  if(ctx.disableSelect !== true) total -= 55;
  
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
  let surplusWidth = total - averageWidth * averageSum;

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

export default {
  findSameRow,
  computeColumnWidth,
  getScrollBarWidth
}