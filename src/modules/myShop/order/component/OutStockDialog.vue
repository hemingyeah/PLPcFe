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
      <base-button type="ghost" @event="outStockDialog = false">取消</base-button>
      <base-button type="primary" @event="confirm">确定</base-button>
    </div>
  </el-dialog>
  <!-- 发货弹窗 end-->
</template>
<script>
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
    };
  },
  methods: {
    confirm() {
      this.$emit("confirm");
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