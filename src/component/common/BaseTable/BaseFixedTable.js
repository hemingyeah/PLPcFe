import TableMixin from './TableMixin';

const BaseFixedTable = {
  name: 'base-fixed-table',
  mixins: [TableMixin],
  methods: {
    updateScroll(event){
      event.preventDefault();

      let bodyEl = this.$refs.body;
      let tableEl = this.$refs.table;
      
      let bodyOffsetHeight = bodyEl.offsetHeight; //外层容器的高度
      let tableOffsetHeight = tableEl.offsetHeight; 
      //无法滚动
      if(tableOffsetHeight <= bodyOffsetHeight) return;

      //1. 兼容不同浏览器的事件
      //2. 根据方向设置offset
      let direction = event.deltaY > 0 ? 4 : -4;

      let offset = bodyEl.scrollTop + direction * 18;
      if(offset < 0) offset = 0;
      if(offset > tableOffsetHeight - bodyOffsetHeight) offset = tableOffsetHeight - bodyOffsetHeight;
      
      //同步滚动body
      let rootEl = this.$el.closest('.base-table')
      let scrollEl = rootEl.querySelector('.base-table__scroll .base-table__body');
      if(scrollEl.scrollTop != offset) scrollEl.scrollTop = offset;
    }
  },
  render(h){
    let attrs = {
      on:{
        wheel: e => this.updateScroll(e)
      }
    };

    return (
      <div class="base-fixed-table">
        <div class="base-table__head">
          <table class="base-table__table">
            <colgroup>
              { this.columns.map(item => <col width={item.width}/>) }
            </colgroup>
            <thead>
              <tr>
                { this.columns.map(column => this.renderHeadCell(h, column)) }
              </tr>
            </thead>
          </table>
        </div>
        <div class="base-table__body" {...attrs} ref="body">
          <table class="base-table__table" ref="table">
            <colgroup>
              { this.columns.map(item => <col width={item.width}/>) }
            </colgroup>
            <tbody>
              { this.renderRow(h, this.rows, this.columns) }
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}


export default BaseFixedTable;