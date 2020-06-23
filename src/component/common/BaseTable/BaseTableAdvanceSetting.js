import _ from 'lodash';
import TableColumn from './TableColumn';

const BaseTableAdvancedSetting = {
  name: 'base-table-advanced-setting',
  data() {
    return {
      show: false,
      rows: []
    }
  },
  methods: {
    /** 显示设置窗 */
    open(columns) {
      this.rows = columns.filter(i => i.type == 'column').map(c => {
        let column = _.cloneDeep(c);

        if (!(column instanceof TableColumn)) {
          column.width = parseInt(column.width)
          column = new TableColumn(column)
        }

        if (column.isAuto) column.width = ''

        return column;
      })

      this.show = true;
    },
    /** 关闭设置窗 */
    close() {
      this.show = false;
    },
    /** 保存设置 */
    save(event) {
      event.preventDefault();
      console.info('this.rows:', this.rows);
       
      let data = this.rows.map(item => {
        return {
          field: item.field,
          show: item.show,
          width: item.width
        }
      })

      this.close();
      this.$emit('save', { type: 'column', data })
    },
    parseWidth(event, row) {
      let value = event.target.value;
      row.width = parseInt(value);
    }
  },
  render() {
    return (
      <base-modal
        title="选择列配置" class="base-table__modal"
        appendToBody={true}
        show={this.show} onClose={this.close}>

        <form class="base-table__setting">
          <div class="base-table__setting-row base-table__setting-head">
            <div class="base-table__setting-row-selection"></div>
            <div class="base-table__setting-row-name"><span>列名</span></div>
            <div class="base-table__setting-row-width">列宽</div>
          </div>
          {
            this.rows.map(row => {
              return (
                <div class={['base-table__setting-row', row.show ? null : 'base-table__setting-row-disable']} >
                  <div class="base-table__setting-row-selection">
                    {
                      row.show == 'important'
                        ? <el-checkbox value={true} disabled />
                        : <el-checkbox value={row.show} onInput={value => row.show = value} />
                    }
                  </div>
                  <div class="base-table__setting-row-name">
                    <span onClick={e => row.show == 'important' ? '' : row.show = !row.show} style={{ width: `${row.width}px` }} key={row.width}>{row.label}</span>
                  </div>
                  <div class="base-table__setting-row-width">
                    <input type="number" placeholder="自适应" value={row.width} onInput={e => this.parseWidth(e, row)} />
                  </div>
                </div>
              )
            })
          }
        </form>

        <template slot="footer">
          <button type="button" class="btn btn-text" onClick={this.close}>关闭</button>
          <button type="button" class="btn btn-primary" onClick={this.save}>保存</button>
        </template>
      </base-modal>
    )
  }
}

export default BaseTableAdvancedSetting;