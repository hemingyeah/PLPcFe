import './BizSelectColumn.scss'

import BizSelectColumnSort from './BizSelectColumnSort'

import _ from 'lodash'
import { typeOf } from '@src/util/assist';

function convertDisplayNameToName(field = {}) {
  field.name = field.displayName
  return field
}

function convertColumnWithSave(field = {}) {
  let column = {
    ...field,
    show: field.show,
  }
  return column
}

/** 
 * 第一版：暂时支持现在的需求，如需支持其他的，后续拓展 
*/
const BizSelectColumn = {
  name: 'biz-select-column',
  data() {
    return {
      columnSortList: [],
      columnTree: {},
      originColumns: [],
      show: false,
      taskType: {}
    }
  },
  methods: {
    buildSortLists(treeNode = {}) {
      let { columns } = treeNode;
      let isColumnsObject = this.isColumnsObject(columns)
      let lists = columns

      if (isColumnsObject) {
        lists = Object.keys(columns).map(key => {
          return { name: columns[key].name, lists: this.buildSortLists(columns[key]) }
        })
      } else {
        lists = columns.filter(column => column.show)
      }

      return lists
    },
    /** 
     * @description 列数据分组处理
     * 目前是按照 templateId 工单类型id 分组的
    */
    columnsDataGrouped(columns = []) {
      // 系统字段组
      let systemFieldsGroup = []
      // 自定义字段组
      let attributeFieldsGroup = {}
      // 字段树🌲
      let columnsTree = {
        system: { name: '系统字段', columns: systemFieldsGroup, checked: false, root: true, toggle: true },
        attribute: { name: '自定义字段', columns: attributeFieldsGroup, checked: false, root: true, toggle: true}
      }
      

      columns.forEach(column => {
        // 是否是系统字段
        let isSystemFiled = !column.templateId 

        if (isSystemFiled) {
          systemFieldsGroup.push(column)
        } else {
          // 按工单类型分组 ( 工单类型是不可以重名的，所以可以用 工单类型名字 为 key )
          let { templateName, templateId } = column
          templateName = this.getTemplateName(templateId) || templateName
          // 判断是否 自定义字段组存在 此类型数据
          if (!attributeFieldsGroup[templateId]) {
            attributeFieldsGroup[templateId] = { name: templateName, columns: [] }
          }
          attributeFieldsGroup[templateId].columns.push(column)
        }

      })

      if (Object.keys(columnsTree.attribute.columns).length == 0) {
        delete columnsTree.attribute
      }

      // 初始化选中
      for(let key in columnsTree) {
        this.toggleTreeChecked(columnsTree[key])
      }
      
      this.initColumnSortList(columns)

      return columnsTree
    },
    /** 
     * @description 关闭设置窗 
    */
    close() {
      this.show = false
    },
    /** 
     * @description 字段复选框 变化
    */
    checkboxFieldChange(value, field, parent, parentOfParent) {
      field.show = value;

      // 判断当前父级下的子级是否全选
      const isCheckedAll = parent.columns.every(column => column.show)
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

      this.columnFieldChangeWithSort(value, field, parent)
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

      this.columnParentChangeWithSort(value, treeNode, parent)
    },
    /** 
     * @description 字段复选框 变化 排序
    */
    columnFieldChangeWithSort(checked, field, parent) {
      let isParentRoot = parent.root
      let sortList = this.columnSortList.slice()

      if (isParentRoot) {
        return (
          checked
            ? this.columnSortList.push(convertDisplayNameToName(field))
            : this.columnSortList = sortList.filter(item => item.fieldName != field.fieldName)
        )
      }

      this.columnSortListMerge(checked, field, parent, sortList);
    },
    /** 
     * @description 获取字段排序列表下 子分类
    */
    columnSortListGetGroup(sortList, parent) {
      let templateGroup = {}
      let templateIndex = -1

      for (let i = 0; i < sortList.length; i++) {
        let item = sortList[i]
        if (item.name == parent.name) {
          templateGroup = item
          templateIndex = i
          break
        }
      }
      
      return { templateGroup, templateIndex }
    },
    /** 
     * @description 字段排序列表合并
    */
    columnSortListMerge(checked, field, parent, sortList) {
      let { templateGroup = {}, templateIndex } = this.columnSortListGetGroup(sortList, parent)
      let templateColumns = templateGroup.lists || []

      checked
        ? templateColumns.push(convertDisplayNameToName(field))
        : templateColumns = templateColumns.filter(item => item.fieldName != field.fieldName)
      // 未找到类型
      templateIndex == -1 
        ? this.columnSortList.push({ name: parent.name, lists: [convertDisplayNameToName(field)] })
        : this.$set(this.columnSortList, templateIndex, { ...templateGroup, lists: templateColumns })
    },
    /** 
     * @description 字段排序列表添加字段列
    */
    columnSortListFieldPush(columns, sortList) {
      columns.forEach(column => {
        let isHave = sortList.some(list => list.fieldName == column.fieldName)
        if (!isHave) {
          sortList.push(convertDisplayNameToName(column))
        }
      })
    },
    /** 
     * @description 父级复选框 变化排序
    */
    columnParentChangeWithSort(checked, treeNode, parent) {
      let isTreeNodeRoot = treeNode.root
      let sortList = this.columnSortList.slice()
      let isColumnsObject = this.isColumnsObject(treeNode.columns)

      // eslint-disable-next-line no-empty
      if (isTreeNodeRoot && isColumnsObject) {
        if (checked) {
          for (let key in treeNode.columns) {
            let item = treeNode.columns[key]
            let { templateGroup = {}, templateIndex } = this.columnSortListGetGroup(sortList, item)

            let isFindedTemplate = templateIndex >= 0
            templateIndex = isFindedTemplate ? templateIndex : sortList.length

            isFindedTemplate 
              ? this.columnSortListFieldPush(item.columns, templateGroup.lists)
              : templateGroup.lists = this.buildSortLists(item)

            sortList[templateIndex] = {
              name: item.name,
              lists: templateGroup.lists
            }
          }
        } else {
          sortList = sortList.filter(item => !Array.isArray(item.lists))
        }
      }
      else if(isTreeNodeRoot && !isColumnsObject) {
        if (checked) {
          let lists = this.buildSortLists(treeNode);
          this.columnSortListFieldPush(lists, sortList)
        } else {
          sortList = sortList.filter(item => Array.isArray(item.lists))
        }
      }
      else {
        if (checked) {
          let templateIndex = sortList.findIndex(item => item.name == treeNode.name)
          templateIndex <= -1 ? templateIndex = sortList.length : null
          
          sortList[templateIndex] = {
            name: treeNode.name,
            lists: this.buildSortLists(treeNode)
          }
        } else {
          sortList = sortList.filter(item => item.name != treeNode.name)
        }
      }
      
      this.columnSortList = sortList
    },
    getTemplateName(templateId) {
      let { taskType } = this
      
      if (templateId == taskType.id) return taskType.name
      
      return null
    },
    /** 
     * @description 初始化排序列表
    */
    initColumnSortList(originColumns) {
      const TemplateMap = {}
      let sortList = []

      originColumns.filter(column => column.show).forEach((column, index) => {
        let isSystemFiled = !column.templateId

        // 系统字段直接添加至 根级
        if (isSystemFiled) {
          return sortList.push(convertDisplayNameToName(column)) 
        } 

        let { templateId, templateName } = column
        let templateData = TemplateMap[templateId]
        if (!templateData) {
          TemplateMap[templateId] = { index, name: templateName, columns: [] }
        }
        
        TemplateMap[templateId].columns.push(convertDisplayNameToName(column))
      })

      for (let key in TemplateMap) {
        let { columns, index, name } = TemplateMap[key]
        sortList.splice(index, 0, {
          name,
          lists: columns
        })
      }

      this.columnSortList = sortList
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
    open(columns, taskType) {
      this.originColumns = _.cloneDeep(columns)
      this.taskType = taskType
      this.columnTree = this.columnsDataGrouped(_.cloneDeep(columns))
      this.show = true
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
      let isHaveChildren = Array.isArray(treeNode.columns)
      let isRoot = treeNode.root
      let isToggle = isRoot ? treeNode.toggle : true
      return (
        <div class="biz-select-column-tree-parent">
          <div class="biz-select-column-tree-parent-header">
            <el-checkbox value={ treeNode.checked } label={ treeNode.name } onInput={ value => this.checkboxParentChange(value, treeNode, parent) }>
              { treeNode.name }
            </el-checkbox>
            {
              isRoot && (
                <div class={['collapse-btn', isToggle ? 'biz-select-column-tree-parent-active' : '']} onClick={e => treeNode.toggle = !treeNode.toggle }>
                  <i class="iconfont icon-more"></i>
                </div>
              )
            }
          </div>
          {
            isToggle && (
              <transition name="slide-down">
                <div class="biz-select-column-tree-child">
                  { 
                    isHaveChildren
                      ? treeNode.columns.map(column => this.renderField(column, treeNode, parent))
                      : treeNode.columns && Object.keys(treeNode.columns).map(key => this.renderTreeNode(treeNode.columns[key], treeNode))
                  }
                </div>
              </transition>
            )
          }
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
      let columns = [];

      this.columnSortList.forEach(column => {
        if (Array.isArray(column.lists)) {
          column.lists.forEach(item => {
            columns.push(convertColumnWithSave(item))
          })
        } else {
          columns.push(convertColumnWithSave(column))
        }
      })

      let columnMap = columns.reduce((acc, column) => (acc[column.fieldName] = column) && acc, {});

      this.originColumns.forEach(originColumn => {
        let { fieldName } = originColumn
        let sortColumn = columnMap[fieldName]
        if (!sortColumn) {
          originColumn.show = false
          columns.push(originColumn)
        }

      })

      this.close();
      this.$emit('save', { type: 'column', data: columns })
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
    },
    /** 
     * @description 切换树的选中
    */
    toggleTreeChecked(treeNode) {
      let isColumnsObject = this.isColumnsObject(treeNode.columns);
      let checked = false;

      if (isColumnsObject) {
        checked = Object.keys(treeNode.columns).every(key => this.toggleTreeChecked(treeNode.columns[key]))
      } else {
        checked = treeNode.columns.every(column => column.show)
      }

      treeNode.checked = checked

      return checked
    }

  },
  render(h) {
    return (
      <base-modal
        appendToBody={ true }
        class="biz-select-column-modal"
        title="选择列" 
        show={ this.show } 
        onClose={ this.close }
      >
        <div class="biz-select-column-body">
          { this.renderTreeDom(h) }
        </div>

        <biz-select-column-sort lists={ this.columnSortList }>
          <div slot="title" class="biz-select-column-sort-title">
            <span class="biz-select-column-sort-title-text">可视字段</span>
            可视字段支持拖拽排序
          </div>
        </biz-select-column-sort>
        
        <template slot="footer">
          <el-button onClick={ this.close }>关闭</el-button>
          <el-button type="primary" onClick={ this.save }>
            保存
          </el-button>
          {/* <button type="button" class="btn btn-text" onClick={ this.close }>关闭</button>
          <button type="button" class="btn btn-primary" onClick={ this.save }>保存</button> */}
        </template>

      </base-modal>
    )
  },
  components: {
    [BizSelectColumnSort.name]: BizSelectColumnSort
  }
}

export default BizSelectColumn;