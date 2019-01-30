import * as util from './util';
import {
  COL_SELECTION_WIDTH
} from './Config'

const BaseDatatableHead = {
  name: "base-datatable-head",
  props: {
    columns: {
      //表格的列
      type: Array,
      default: () => []
    },
    /** 是否选中全部 */
    isSelectAll: {
      type: Boolean,
      default: false
    },
    rows: {
      //表格的行
      type: Array,
      default: () => []
    },
    /** 是否选中全部 */
    isNotSelectAll: {
      type: Boolean,
      default: false
    },
    /** 多选 */
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      maxTotal: 0,
      colWidth: [],
      num: 0,
      headKey: Math.random() * 100 >> 0,
    };
  },
  computed: {
    isSelect() {
      return this.isNotSelectAll
    }
  },
  methods: {
    /** 检测是否全部选中 */
    checkIsSelectAll(rows) {
      for (let i = 0; i < rows.length; i++) {
        let row = rows[i];
        if (!row.selected) return false;
        if (Array.isArray(row.children) && row.children.length > 0) {
          if (!this.checkIsSelectAll(row.children)) return false;
        }
      }

      return true;
    },
    toggleSelectAll(value) {
      let isSelectAll = value;
      this.$emit("toggleSelectAll", isSelectAll);
    },
    /** 渲染表格内容 */
    renderCell(h, columns) {
      return columns.map(col => (
        <th>
          <div class="base-datatable-cell">
            {
              typeof col.headRender == "function"
                ? col.headRender(h, col)
                : col.label
            }
          </div>
        </th>
      ));
    },
  },
  render(h) {
    let columns = this.columns;
    let tableWidth = this.multiple ? this.$parent.$el.clientWidth - COL_SELECTION_WIDTH : this.$parent.$el.clientWidth;
    let colWidths = util.computeColumnWidth(columns, tableWidth, this)
    let total = colWidths.reduce((sum, w) => sum += w) + (this.multiple ? COL_SELECTION_WIDTH : 0);

    // this.$nextTick(() => {
    //   this.num++
    //   if(1 == this.num) this.headKey = Math.random() * 100 >> 0
    // })

    return (
      <table class="base-datatable__table base-datatable__head" width={total} key={this.headKey}>
        <colgroup>
          { this.multiple ? <col width={COL_SELECTION_WIDTH} /> : '' }
          { colWidths.map(item => <col width={item}/>) }
        </colgroup>
        <thead>
          <tr>
            {
              this.multiple ?
                <th class="base-datatable-checkbox">
                  <el-checkbox
                    indeterminate={this.isSelect}
                    value={this.isSelectAll}
                    key="base-table-checkbox"
                    onInput={value => this.toggleSelectAll(value)}
                  />
                </th> :
                ''
            }
            {this.renderCell(h, this.columns)}
          </tr>
        </thead>
      </table>
    );
  }
};

export default BaseDatatableHead