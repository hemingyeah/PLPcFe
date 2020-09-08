<template>
  <base-modal class="task-receipt-edit-container" :title="title" :show.sync="visible" width="700px" @closed="reset">
    <div class="base-modal-content" v-if="init">
      <form-builder ref="form" :fields="fields" :value="form" @update="update">
        <!-- start 合计 -->
        <template v-if="hasExpense" slot="template" slot-scope="{ field }">
          <form-item :label="field.displayName" class="task-receipt-expense">
            <div class="item">
              <label>备件费用</label>
              <span>{{ sparepartTotal }}</span>
            </div>
            <div class="item">
              <label>服务费用</label>
              <span>{{ serviceTotal }}</span>
            </div>
            <div class="item" v-if="showDiscountCost">
              <label>折扣费用</label>
              <input type="number" class="text-red" v-model="form.disExpense" @input="updateDisExpense" @blur="disExpenseBlur" />
            </div>
            <div class="item">
              <label>总计</label>
              <span>{{ totalExpense }}</span>
            </div>
          </form-item>
        </template>
        <!-- end 合计 -->
      </form-builder>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取 消</el-button>
      <el-button type="primary" :disabled="pending" @click="submit">保 存</el-button>
    </div>
  </base-modal>
</template>

<script>
import TaskReceiptEditView from './TaskReceiptEditView';
export default TaskReceiptEditView;
</script>

<style lang="scss">
@import './TaskReceiptEditView.scss';
</style>
