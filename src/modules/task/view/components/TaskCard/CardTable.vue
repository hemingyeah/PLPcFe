<template>
  <el-table
    header-row-class-name="base-table-header-v3"
    row-class-name="base-table-row-v3"
    class="multiple-card-table"
    :data="data"
    stripe>
    <el-table-column
      v-for="column in columns"
      :key="column.fieldId"
      :label="column.displayName"
      :prop="column.fieldName"
      show-overflow-tooltip
      :min-width="column.minWidth || '120px'">
      <template slot-scope="scope">
        <!-- start 附件类型 -->
        <template v-if="column.formType === 'attachment'">
          <span class="column-attachment" v-if="scope.row[column.fieldName] && scope.row[column.fieldName].length">
            <i class="iconfont icon-attachment"></i>
            共{{ scope.row[column.fieldName].length }}个附件
          </span>
        </template>
        <!-- end 附件类型 -->

        <!-- start 多选 -->
        <template v-else-if="isMulti(column)">
          {{ (scope.row[column.fieldName] || []).join('，') }}
        </template>
        <!-- end 多选 -->

        <!-- start 位置 -->
        <template v-else-if="isHoursRecord && column.fieldName === 'location'">
          <el-button
            type="text"
            size="mini"
            v-if="scope.row.fromType == 2"
            @click="handleEvent('location', scope.row)"
          >查看</el-button>
        </template>
        <!-- end 位置 -->

        <!-- start 操作时间 -->
        <template v-else-if="column.fieldName === 'updateTime'">
          {{ scope.row[column.fieldName] | fmt_datetime }}
        </template>
        <!-- end 操作时间 -->

        <!-- start 操作 -->
        <template v-else-if="column.fieldName === 'action'">
          <el-button
            type="text"
            size="mini"
            @click="handleEvent('view', scope.row)"
          >详情</el-button>

          <el-button
            type="text"
            size="mini"
            v-if="showEditBtn(scope.row)"
            @click="handleEvent('edit', scope.row)"
          >编辑</el-button>

          <el-button
            type="text"
            size="mini"
            v-if="allowDelete"
            @click="handleEvent('delete', scope.row)"
          >删除</el-button>
        </template>
        <!-- end 操作 -->

        <template v-else>
          {{ scope.row[column.fieldName] }}
        </template>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>

export default {
  name: 'multiple-card-table',
  props: {
    data: {
      type: Array,
      default: () => ([])
    },
    columns: {
      type: Array,
      default: () => ([])
    },
    isHoursRecord: {
      type: Boolean,
      default: false
    },
    allowCreate: {
      type: Boolean,
      default: false
    },
    allowEdit: {
      type: Boolean,
      default: false
    },
    allowDelete: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    /** 
    * @description 显示编辑按钮
    * 1.附加组件是工时记录类型时，有编辑权限且是pc端数据
    * 2.普通附加组件有编辑权限
    */
    showEditBtn(row) {
      let editAuth = this.allowEdit;

      // 工时记录类型
      if (this.isHoursRecord) return editAuth && row.fromType == 1;

      return editAuth;
    },
    /** 
    * @description 字段是否是多选类型
    */
    isMulti(field) {
      let { formType, setting = {}} = field;
      if (formType === 'selectMulti') return true;
      if (formType === 'select' && setting.isMulti) return true;
      return false;
    },
    /** 
    * @description 附加组件操作
    */
    handleEvent(action, row) {
      let data = {
        cardInstance: row,
        action
      }

      this.$emit('action', data);
    }
  }
}
</script>

<style lang="scss">
.multiple-card-table {
  margin-bottom: 20px;
  
  .base-table-row-v3 td {
    .column-attachment {
      .iconfont {
        font-size: 12px;
      }
    }
  }
}
</style>
