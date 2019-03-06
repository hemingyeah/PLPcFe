import TableMixin from './TableMixin'
import {PaddingColumn} from './TableColumn';

const BaseTableBody = {
  name: 'base-table-body',
  mixins: [TableMixin],
  props: {
    /**
     * 组件的最大高度, 设置此值后会启用流式布局
     * 如果值String时，请确保传入正确的值，该值会用于calc()计算
     * 示例： 100vh - 44px => max-height: calc(100vh - 44px)
     */
    maxHeight: [Number, String]
  },
  data() {
    return {
      tableEl: this.$parent.$el,
      scroll: {
        left: 0,
        top: 0
      }
    }
  },
  computed: {
    /** 纵向最大高度 */
    scrollYMaxHeight() {
      //启用流式布局需要计算滚动区域最大高度
      if(this.maxHeight){
        let max = this.maxHeight;
        let headOffsetHeight = this.rootEl.querySelector('.base-table__head').offsetHeight;

        if(typeof max == 'number'){
          return max - headOffsetHeight + 'px';
        }

        if(typeof max == 'string'){
          return `calc(${max} - ${headOffsetHeight}px)`;
        }
      }

      return undefined;
    }
  },
  methods: {
    /** 同步滚动 */
    updateScrollStytle(event){
      let {scrollLeft, scrollTop, offsetWidth, scrollWidth} = event.target;

      //纵向滚动
      if(scrollTop != this.scroll.top){
        //同步左固定栏目高度
        let leftEl = this.rootEl.querySelector('.base-table__fixed-left .base-table__body');
        let rightEl = this.rootEl.querySelector('.base-table__fixed-right .base-table__body');
        
        if(leftEl) leftEl.scrollTop = scrollTop;
        if(rightEl) rightEl.scrollTop = scrollTop;

        this.scroll.top = scrollTop;
      }

      //横向滚动
      if(scrollLeft != this.scroll.left){
        this.scroll.left = scrollLeft;
        
        //同步滚动head
        let headEl = this.rootEl.querySelector('.base-table__head-scroll');
        if(headEl) headEl.scrollLeft = event.target.scrollLeft;
      }
      
      this.$emit('scroll');
    },
    
    updateLayout(){
      this.$emit('layout')
    }
  },
  render(h){
    //无数据返回空提示
    if(this.rows.length <= 0){
      let tips = this.$parent.$slots.empty || <span class="base-table-empty-text">暂无数据</span>
      return <div class="base-table-empty">{tips}</div>
    }

    let leftFixedColumns = []
    let scrollColumns = []
    let rightFixedColumns = [];

    this.columns.forEach(col => {
      if(col.fixed == 'left') return leftFixedColumns.push(col);
      if(col.fixed == 'right') return rightFixedColumns.push(col);

      return scrollColumns.push(col);
    })

    let leftTotal = leftFixedColumns.reduce((sum, col) => sum += col.width, 0);
    let rightTotal = rightFixedColumns.reduce((sum, col) => sum += col.width, 0);
    let scrollTotal = scrollColumns.reduce((sum, col) => sum += col.width, 0);

    // this.$nextTick(() => {
    //   this.num++
    //   if(1 == this.num) this.bodyKey = Math.random() * 100 >> 0
    // })

    let style = {maxHeight: this.scrollYMaxHeight};
    if(leftTotal > 0) {
      let index = scrollColumns.findIndex(item => item.type == 'selection');
      index = index <= 0 ? 0 : index + 1;
      scrollColumns.splice(index, 0, new PaddingColumn(leftTotal)) 
    } 

    if(rightTotal > 0) scrollColumns.push(new PaddingColumn(rightTotal))  

    this.$nextTick(this.updateLayout)

    return (
      <div class="base-table-tbody base-table__body" 
        style={style} key={this.key} ref="body"
        onScroll={e => this.updateScrollStytle(e)}>
        <table class="base-table__table" width={leftTotal + scrollTotal + rightTotal} ref="table">
          <colgroup>
            { scrollColumns.map(item => <col width={item.width}></col>) }
          </colgroup>
          <tbody class="base-table-body">
            { this.renderRow(h, this.rows, scrollColumns) }
          </tbody>
        </table> 
      </div>
    )
  }
}

export default BaseTableBody