<template>
  <!-- 发货弹窗 start-->
  <el-dialog title="订单发货" :visible.sync="goodsDialog" width="390px" :close-on-click-modal="false">
    <div class="goods-dialog-box" v-if="infoData.goodsInfos">
      <div class="goods-dialog-item flex-x" v-for="(item, index) in infoData.goodsInfos" :key="index">
        <img class="mar-r-10" :src="goodsImg" />
        <div class="goods-dialog-item-info flex-1">
          <div class="flex-x">
            <div
              class="font-12 overHideCon-2 flex-1 al-start mar-r-10"
            >{{item.name}}</div>
            <div class="font-10 color-666">x{{item.goodsCount}}</div>
          </div>
          <div class="flex-x">
            <div class="font-12 color-666 flex-1">{{item.standard}}</div>
            <div class="font-12 price-tag">¥{{item.salePrice}}</div>
          </div>
        </div>
      </div>

      <div class="oddnum-box">
        <div class="mar-b-12">添加物流信息：</div>
        <el-input v-model="oddNum" placeholder="请输入"></el-input>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <base-button type="ghost" @event="goodsDialog = false">取消</base-button>
      <base-button type="primary" @event="confirm">确认发货</base-button>
    </div>
  </el-dialog>
  <!-- 发货弹窗 end-->
</template>
<script>
import goodsImg from "@src/assets/img/no-data.png";
export default {
  name: "goods-dialog",
  props: {
    infoData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      goodsDialog: false,
      goodsImg,
      oddNum: "",
    };
  },
  methods: {
    confirm() {
      this.$emit("confirm");
    },
    changeDialog(e) {
      this.goodsDialog = e;
    },
  },
};
</script>
<style lang="scss" scoped>
.goods-dialog-box {
  max-height: 355px;
  overflow-y: scroll;
  .goods-dialog-item {
    padding: 9px 20px;
    box-sizing: border-box;
    border-bottom: 1px dashed #e1e3e2;
    img {
      width: 52px;
      height: 52px;
    }
    .goods-dialog-item-info {
      height: 52px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      .price-tag {
        color: #fb602c;
      }
    }
  }

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