import _ from 'lodash';

const BizSelectColumn = {
  name: 'biz-select-column',
  data() {
    return {
      show: false,
      rows: []
    }
  },
  methods: {
    /** 关闭设置窗 */
    close() {
      this.show = false;
    },
    /** 显示设置窗 */
    open(columns) {
      this.rows = columns.filter(i => i.type == 'column');
      this.show = true;
    },
  },
  render() {
    return (
      <base-modal
        title="选择列" class="biz-select-column-modal"
        appendToBody={ true }
        show={ this.show } 
        onClose={ this.close }>

        
        <template slot="footer">
          <button type="button" class="btn btn-text" onClick={ this.close }>关闭</button>
          <button type="button" class="btn btn-primary" onClick={ this.save }>保存</button>
        </template>
      </base-modal>
    )
  }
}

export default BizSelectColumn;