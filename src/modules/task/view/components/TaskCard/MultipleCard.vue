<template>
  <div class="multiple-card-container">
    <!-- start 附加组件列表 -->
    <multiple-card-table
      :data="value.attribute"
      :columns="columns"
      :allow-create="allowCreate"
      :allow-edit="allowEdit"
      :allow-delete="allowDelete"
      @action="handleEvent"
    />
    <!-- end 附加组件列表 -->

    <!-- start 按钮组 -->
    <div class="btn-group" v-if="allowCreate">
      <el-button
        @click="handleEvent({action: 'create'})"
        type="primary"
        size="mini"
        plain
      >添加记录</el-button>
    </div>
    <!-- end 按钮组 -->

    <!-- start 附加组件详情弹窗 -->
    <task-card-view-dialog
      ref="taskCardView"
      :fields="card.fields"
      :value.sync="cardInstance"
    />
    <!-- end 附加组件详情弹窗 -->

    <!-- start 新增/编辑附加组件弹窗 -->
    <task-card-edit-dialog
      ref="taskCardEdit"
      :fields="card.fields"
      :value.sync="cardInstance"
      :action="action"
      @submit="submit"
    />
    <!-- end 新增/编辑附加组件弹窗 -->
  </div>
</template>

<script>
/* components */
import MultipleCardTable from './CardTable';

/* mixin */
import cardMixin from './mixin';

export default {
  name: 'multiple-card',
  mixins: [cardMixin],
  props: {
    value: {
      type: Object,
      default: () => ({
        attribute: []
      })
    }
  },
  computed: {
    columns() {
      let formTypes = ['autograph', 'attachment', 'separator', 'info'];
      let fields = [
        ...this.card.fields,
        {
          displayName: '操作人',
          fieldName: 'userName',
          minWidth: '80px'
        },
        {
          displayName: '操作时间',
          fieldName: 'updateTime',
          minWidth: '160px'
        },
        {
          displayName: '操作',
          fieldName: 'action',
          minWidth: '140px'
        }
      ]
      
      return fields.filter(field => !field.isHidden && (field.isVisible == undefined || field.isVisible) && formTypes.indexOf(field.formType) < 0);
    }
  },
  components: {
    [MultipleCardTable.name]: MultipleCardTable
  }
}
</script>
