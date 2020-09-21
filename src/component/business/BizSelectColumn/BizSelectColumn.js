import _ from 'lodash';

import './BizSelectColumn.scss'
import { typeOf } from '@src/util/assist';
import Columns from './columnData'

/** 
 * 第一版：暂时支持现在的需求，如需支持其他的，后续拓展 
*/
const BizSelectColumn = {
  name: 'biz-select-column',
  data() {
    return {
      columnTree: {},
      show: false
    }
  },
  methods: {
    /** 
     * @description 列数据分组处理
     * 目前是按照 templateId 工单类型id 分组的
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
            attributeFieldsGroup[templateId] = { name: templateName, columns: [], checked: false }
          }
          attributeFieldsGroup[templateId].columns.push(column)
        }

      })

      columnsTree = {
        system: { name: '系统字段', columns: systemFieldsGroup, checked: false, root: true },
        attribute: { name: '自定义字段', columns: attributeFieldsGroup, checked: false, root: true }
      }

      return columnsTree
    },
    /** 
     * @description 关闭设置窗 
    */
    close() {
      this.show = false;
    },
    /** 
     * @description 字段复选框 变化
    */
    checkboxFieldChange(value, field, parent, parentOfParent) {
      field.show = value;

      // 判断当前父级下的子级是否全选
      const isCheckedAll = parent.columns.every(column => column.show == true)
      parent.checked = isCheckedAll

      // 判断如果父级全选，则去寻找父级的兄弟层级，进而判断 父父级的状态
      if (isCheckedAll) {
        // 判断父父级的是否是对象
        let isObjectChildren = this.isColumnsObject(parentOfParent.columns)
        let isParentOfParentChecdAll = true;

        if (isObjectChildren) {
          for (let key in parentOfParent.columns) {
            let child = parentOfParent.columns[key];
            if (!child) {
              isParentOfParentChecdAll = false;
              break;
            }
          }

          parentOfParent.checked = isParentOfParentChecdAll;
        }
      } else {
        parentOfParent.checked = false;
      }

    },
    /** 
     * @description 父级复选框 变化
    */
    checkboxParentChange(value, treeNode, parent) {
      treeNode.checked = value;
      // 全选
      if (value) {
        this.toggleCheckedWithDown(treeNode, true)
        this.toggleCheckedWithUp(treeNode, parent)
      } else {
        this.toggleCheckedWithDown(treeNode)
        this.toggleCheckedWithUp(treeNode, parent)
      }
    },
    /** 
     * @description 列数据 是否是 对象
    */
    isColumnsObject(columns) {
      return typeOf(columns) === 'object'
    },
    /** 
     * @description 显示 设置窗
    */
    open(columns) {
      this.columnTree = this.columnsDataGrouped(Columns.slice());
      this.show = true;
    },
    /** 
     * @description 渲染字段
    */
    renderField(field = {}, parent = {}, parentOfParent = {}) {
      return (
        <div class="biz-select-column-field">
          <el-checkbox value={ field.show } label={ field.displayName } onInput={ value => this.checkboxFieldChange(value, field, parent, parentOfParent) }>
            { field.displayName }
          </el-checkbox>
        </div>
      )
    },
    /** 
     * @description 渲染树节点
    */
    renderTreeNode(treeNode = {}, parent = {}) {
      let isHaveChildren = Array.isArray(treeNode.columns);
      return (
        <div class="biz-select-column-tree-parent">
          <span>
            <el-checkbox value={ treeNode.checked } label={ treeNode.name } onInput={ value => this.checkboxParentChange(value, treeNode, parent) }>
              { treeNode.name }
            </el-checkbox>
          </span>
          <div class="biz-select-column-tree-child">
            { 
              isHaveChildren
                ? treeNode.columns.map(column => this.renderField(column, treeNode, parent))
                : treeNode.columns && Object.keys(treeNode.columns).map(key => this.renderTreeNode(treeNode.columns[key], treeNode))
            }
          </div>
        </div>
      )
    },
    /** 
     * @description 渲染树 Document Object Model
    */
    renderTreeDom(h) {
      let tree = this.columnTree;
      
      const TreeDom = Object.keys(tree).map(treeKey => {
        return (
          this.renderTreeNode(tree[treeKey], tree[treeKey])
        )
      })
      
      return TreeDom
    },
    /** 
     * @description 保存
    */
    save() {
      // 
    },
    /** 
     * @description 向下 -> 切换 是否选中
    */
    toggleCheckedWithDown(treeNode, checked = false) {
      let isColumnsObject = this.isColumnsObject(treeNode.columns);
    
      if (isColumnsObject) {
        for (let key in treeNode.columns) {
          this.toggleCheckedWithDown(treeNode.columns[key], checked);
        }
      } else {
        treeNode.checked = checked
        treeNode.columns.forEach(column => column.show = checked);
      }
    
    },
    /** 
     * @description 向上 -> 切换 是否选中
    */
    toggleCheckedWithUp(treeNode, parent) {
      // 根级
      if (treeNode.root) return

      let isColumnsObject = this.isColumnsObject(parent.columns);
      let isChildAllChecked = false;
      
      if (isColumnsObject) {
        for(let key in parent.columns) {
          let column = parent.columns[key]
          isChildAllChecked = column.checked
  
          if (!isChildAllChecked) break;
        }

        parent.checked = isChildAllChecked;
      }
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
          { this.renderTreeDom(h) }
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