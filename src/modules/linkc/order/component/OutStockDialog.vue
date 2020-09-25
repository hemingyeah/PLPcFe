<template>
  <!-- 出库弹窗 start-->
  <el-dialog
    title="申领订单商品（生成出库单）"
    :visible.sync="outStockDialog"
    width="390px"
    :close-on-click-modal="false"
  >
    <div class="goods-dialog-box">
      <div class="oddnum-box">
        <div class="mar-b-12">备注</div>
        <el-input v-model="remark" type="textarea" maxlength="500" placeholder="请输入"></el-input>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="ghost" @click="changeDialog(false)">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
  <!-- 发货弹窗 end-->
</template>
<script>
import { repertoryOut } from "@src/api/Linkc";
export default {
  name: "out-stock-dialog",
  props: {
    infoData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      outStockDialog: false,
      remark: "",
      loading: false,
    };
  },

  watch: {
    outStockDialog() {
      this.remark = "";
    },
  },
  methods: {
    confirm() {
      this.loading = true;
      repertoryOut({
        orderNum: this.infoData.orderId,
        remrk: this.remrks,
        // orderNum: this.trackingNum,
      })
        .then((res) => {
          if (res.status == 200) {
            this.changeDialog(false);
            this.$emit("confirm");
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    changeDialog(e) {
      this.outStockDialog = e;
    },
  },
};
</script>
<style lang="scss" scoped>
.goods-dialog-box {
  max-height: 450px;
  overflow-y: scroll;
  .oddnum-box {
    padding: 16px 20px;
  }
}
</style>
<style lang="scss">
.el-dialog__body {
  border-top: 1px solid rgba(0, 0, 0, 0.09);
  border-bottom: 1px solid rgba(0, 0, 0, 0.09);
  padding: 0;
}
</style>