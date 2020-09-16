<template>
  <div class="single-card-container">
    <form-view :fields="fields" :value="value">
      <!-- start 操作时间 -->
      <template slot="updateTime" slot-scope="{ field, value }">
        <div class="form-view-row">
          <label>{{ field.displayName }}</label>
          <div class="form-view-row-content">{{ value | fmt_datetime }}</div>
        </div>
      </template>
      <!-- end 操作时间 -->
    </form-view>

    <!-- start 按钮组 -->
    <div class="btn-group" v-if="showDeleteBtn || showCreateBtn || showEditBtn">
      <el-button
        type="danger"
        size="mini"
        plain
        v-if="showDeleteBtn"
        @click="deleteCard(cardInstanceId)"
      >删除</el-button>

      <el-button
        size="mini"
        plain
        @click="openDialog"
        v-if="showCreateBtn || showEditBtn"
      >编辑</el-button>
    </div>
    <!-- end 按钮组 -->

    <!-- start 新增/编辑附加组件弹窗 -->
    <task-card-edit-dialog
      ref="taskCardEdit"
      :fields="card.fields"
      :value.sync="value"
      :action="action"
      @submit="submit"
    />
    <!-- end 新增/编辑附加组件弹窗 -->
  </div>
</template>

<script>
/* mixin */
import cardMixin from './mixin';

export default {
  name: 'single-card',
  mixins: [cardMixin],
  props: {
    value: {
      type: Object,
      default: () => ({
        attribute: {}
      })
    }
  },
  computed: {
    fields() {
      return [
        ...this.card.fields,
        {
          displayName: '操作人',
          fieldName: 'userName'
        },
        {
          displayName: '操作时间',
          fieldName: 'updateTime'
        }
      ]
    },
    /** 
    * @description 附加组件实例id
    */
    cardInstanceId() {
      return (this.value?.attribute || {}).id;
    },
    /** 
    * @description 显示编辑按钮(新增)
    * 该单次附加组件无数据时且有新增权限
    */
    showCreateBtn() {
      return !this.cardInstanceId && this.allowCreate;
    },
    /** 
    * @description 显示编辑按钮
    * 该单次附加组件有数据，且有编辑权限
    */
    showEditBtn() {
      return this.cardInstanceId && this.allowEdit;
    },
    /** 
    * @description 显示删除按钮
    * 该单次附加组件有数据时且有删除权限
    */
    showDeleteBtn() {
      return this.cardInstanceId && this.allowDelete;
    }
  },
  methods: {
    /**
    * @description 打开新增、编辑弹窗
    */
    openDialog() {
      this.action = this.showCreateBtn ? 'create' : 'edit';
      this.$refs.taskCardEdit.openDialog();
    }
  }
}
</script>

<style lang="scss" scoped>
.single-card-container {
  .form-view {
    padding: 0 12px;

    /deep/ .items-of-group {
      display: flex;
      flex-wrap: wrap;

      .form-view-row {
        width: 50%;

        &:nth-child(odd) {
          padding-right: 10px;
        }

        &:nth-child(even) {
          padding-left: 10px;
        }
      }
    }
  }
}
</style>