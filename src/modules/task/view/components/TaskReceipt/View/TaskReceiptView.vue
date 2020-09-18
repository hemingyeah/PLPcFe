<template>
  <div class="task-tab-container task-receipt-view-container">
    <div class="task-receipt-detail-content">
      <!-- start 审批中icon -->
      <div class="approving-img" v-if="isFinishApproving">
        <img :src="getApprovingImg()" />
      </div>
      <!-- end 审批中icon -->

      <!-- start 支付成功icon -->
      <div class="approving-img" v-if="!isFinishApproving && payOnlineSuccess">
        <img :src="getPaySuccessImg()" />
      </div>
      <!-- end 支付成功icon -->

      <!-- start 回执信息 -->
      <form-view :fields="fields" :value="form">
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
      <!-- end 回执信息 -->

      <!-- start 合计 -->
      <div class="form-view-row" v-if="hasExpense">
        <label>费用合计</label>
        <div class="form-view-row-content">
          <el-table :data="totalData" header-row-class-name="base-table-header-v3" row-class-name="base-table-row-v3" border>
            <el-table-column prop="sparepartTotal" label="备件费用" v-if="showSparepart"></el-table-column>
            <el-table-column prop="serviceTotal" label="服务费用" v-if="showService"></el-table-column>
            <el-table-column label="折扣费用" prop="disExpense" v-if="form.disExpense != null"></el-table-column>
            <el-table-column prop="totalExpense" label="应收合计(元)"></el-table-column>
          </el-table>
        </div>
      </div>
      <!-- end 合计 -->

      <!-- start 支付信息 -->
      <div class="form-view-row" v-if="paymentMethod">
        <label>客户支付方式</label>
        <div class="form-view-row-content payment-info-row">
          <p class="payment-method">
            支付方式：
            <img v-if="getPaymentMethodImg()" :src="getPaymentMethodImg()" />
            {{ paymentMethod }}
          </p>
          <div class="payment-method-detail" v-if="payOnlineSuccess">
            <p>收款方式：{{ paymentInfo.payType }}</p>
            <p>付款账号：{{ paymentInfo.buyerLogonId }}</p>
            <p>商家订单号：{{ paymentInfo.shbTradeNo }}</p>
            <p>交易创建时间：{{ paymentInfo.createTime | fmt_datetime }}</p>
          </div>
        </div>
      </div>
      <!-- end 支付信息 -->
    </div>

    <!-- start 按钮组 -->
    <div class="btn-group">
      <el-button size="mini" @click="openDialog" v-if="allowEditReceipt">编辑回执</el-button>
    </div>
    <!-- end 按钮组 -->

    <!-- start 编辑回执弹窗 -->
    <task-receipt-edit-view
      ref="taskReceiptEdit"
      :init-data="initData"
      :receipt-fields="shareData.receiptFields"
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
