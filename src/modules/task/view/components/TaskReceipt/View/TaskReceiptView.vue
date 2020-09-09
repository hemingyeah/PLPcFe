<template>
  <div class="task-tab-container task-receipt-view-container">
    <div class="task-receipt-detail-content">
      <!-- start 审批中icon -->
      <div class="approving-img" v-if="isFinishApproving">
        <img :src="getApprovingImg()" />
      </div>
      <!-- end 审批中icon -->

      <!-- start 非自定义回执 -->
      <template v-if="notCustom">
        
      </template>
      <!-- end 非自定义回执 -->

      <!-- start 自定义回执 -->
      <form-view :fields="fields" :value="form" v-else>
        <!-- start 备件 -->
        <template slot="sparepart" slot-scope="{ field, value }">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content">
              <receipt-view-common-table :data="value" :colums="sparepartColums" />
            </div>
          </div>
        </template>
        <!-- end 备件 -->

        <!-- start 服务项目 -->
        <template slot="serviceIterm" slot-scope="{ field, value }">
          <div class="form-view-row">
            <label>{{ field.displayName }}</label>
            <div class="form-view-row-content">
              <receipt-view-common-table :data="value" :colums="serviceColums" />
            </div>
          </div>
        </template>
        <!-- end 服务项目 -->
      </form-view>
      <!-- end 自定义回执 -->

      <!-- start 合计 -->
      <div class="totalExpense" v-if="hasExpense">
        <span v-if="form.disExpense">折扣费用：{{ form.disExpense }}</span>
        <span>合计：{{ totalExpense }}</span>
      </div>
      <!-- end 合计 -->

    </div>

    <!-- start 按钮组 -->
    <div class="btn-group">
      <el-button size="small" @click="openDialog" v-if="allowEditReceipt">编辑回执</el-button>
    </div>
    <!-- end 按钮组 -->

    <!-- start 编辑回执弹窗 -->
    <task-receipt-edit-view
      ref="taskReceiptEdit"
      :init-data="initData"
    />
    <!-- end 编辑回执弹窗 -->
  </div>
</template>

<script>
import TaskReceiptView from './TaskReceiptView';
export default TaskReceiptView;
</script>

<style lang="scss" scoped>
@import './TaskReceiptView.scss';
</style>
