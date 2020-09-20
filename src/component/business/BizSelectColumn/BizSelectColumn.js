import _ from 'lodash';

import Columns from './columnData'

const BizSelectColumn = {
  name: 'biz-select-column',
  data() {
    return {
      show: false,
      rows: [],
      columnTree: {}
    }
  },
  methods: {
    /** 
     * @description 列数据分组处理
    */
    columnsDataGrouped(columns = []) {
      // 字段树🌲
      let columnsTree = {};
      // 系统字段组
      let systemFieldsGroup = [];
      // 自定义字段组
      let attributeFieldsGroup = {};

      columns.forEach(column => {
        // 是否是系统字段 TODO: && column.isSystem == 1
        let isSystemFiled = !column.templateId 

        if (isSystemFiled) {
          systemFieldsGroup.push(column)
        } else {
          // 按工单类型分组 ( 工单类型是不可以重名的，所以可以用 工单类型名字 为 key )
          let { templateName, templateId } = column
          // 判断是否 自定义字段组存在 此类型数据
          if (!attributeFieldsGroup[templateId]) {
            attributeFieldsGroup[templateId] = { name: templateName, columns: [] }
          }
          attributeFieldsGroup[templateId].columns.push(column)
        }

      })

      columnsTree = {
        system: { name: '系统字段', columns: systemFieldsGroup },
        attribute: { name: '自定义字段', columns: attributeFieldsGroup }
      }

      return columnsTree
    },
    /** 关闭设置窗 */
    close() {
      this.show = false;
    },
    /** 显示设置窗 */
    open(columns) {
      this.columnTree = this.columnsDataGrouped(Columns);
      this.show = true;
    },
    renderField(field = {}) {
      return (
        <div>
          { field.displayName }
        </div>
      )
    },
    renderTreeNode(tree = {}) {
      let isHaveChildren = Array.isArray(tree.columns);
      return (
        <div>
          <span>{ tree.name }</span>
          <div>
            { 
              isHaveChildren
                ? tree.columns.map(column => this.renderField(column))
                : tree.columns && Object.keys(tree.columns).map(child => this.renderTreeNode(child))
            }
          </div>
        </div>
      )
    },
    renderColumnTreeDom(h) {
      let tree = this.columnTree;
      
      const TreeDom = Object.keys(tree).map(treeKey => {
        return (
          this.renderTreeNode(tree[treeKey])
        )
      })
      
      return TreeDom
    }
  },
  render(h) {
    return (
      <base-modal
        title="选择列" class="biz-select-column-modal"
        appendToBody={ true }
        show={ this.show } 
        onClose={ this.close }
      >
        <div class="biz-select-column-body">
          { this.renderColumnTreeDom(h) }
        </div>
        
        <template slot="footer">
          <button type="button" class="btn btn-text" onClick={ this.close }>关闭</button>
          <button type="button" class="btn btn-primary" onClick={ this.save }>保存</button>
        </template>
      </base-modal>
    )
  }
}

export default BizSelectColumn;