<template>
  <base-modal class="task-receipt-edit-container" :title="title" :show.sync="visible" width="700px" @closed="reset">
    <div class="base-modal-content" v-if="init">
      <form-builder ref="form" :fields="fields" :value="form" @update="update"></form-builder>

      <!-- start 合计 -->
      <div class="form-item" v-if="showSparepart || showService">
        <label>费用合计</label>
        <div class="form-item-control">
          <el-table :data="totalData" header-row-class-name="base-table-header-v3" row-class-name="base-table-row-v3" border>
            <el-table-column prop="sparepartTotal" label="备件费用" v-if="showSparepart"></el-table-column>
            <el-table-column prop="serviceTotal" label="服务费用" v-if="showService"></el-table-column>
            <el-table-column label="折扣费用" v-if="showDiscountCost">
              <template slot-scope="scope">
                <input type="number" class="disExpense" v-model="scope.row.disExpense" @input="updateDisExpense" @blur="disExpenseBlur" />
              </template>
            </el-table-column>
            <el-table-column prop="totalExpense" label="应收合计(元)"></el-table-column>
          </el-table>
        </div>
      </div>
      <!-- end 合计 -->
    </div>
    <div slot="footer" class="dialog-footer">
      <template v-if="action == 'edit'">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" :disabled="pending" @click="submit">保 存</el-button>
      </template>
      <template v-else>
        <el-button type="danger" @click="visible = false">取 消</el-button>
        <el-button :disabled="pending" @click="draft">暂 存</el-button>
        <el-button type="primary" :disabled="pending" @click="submit">完成回执</el-button>
      </template>
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
