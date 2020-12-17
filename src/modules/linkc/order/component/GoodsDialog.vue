<template>
  <!-- 发货弹窗 start-->
  <el-dialog title="订单发货" :visible.sync="goodsDialog" width="390px" :close-on-click-modal="false">
    <div class="goods-dialog-box" v-if="infoData.goodsInfos">
      <div
        class="goods-dialog-item flex-x"
        v-for="(item, index) in infoData.goodsInfos"
        :key="index"
      >
        <img
          class="mar-r-10"
          :src="item.thumbnailUrl ? `${item.thumbnailUrl}?x-oss-process=image/resize,m_fill,h_52,w_52` : defaultImg"
        />
        <div class="goods-dialog-item-info flex-1">
          <div class="flex-x">
            <div class="font-12 overHideCon-2 flex-1 al-start mar-r-10">{{item.name}}</div>
            <div class="font-10 color-666">x{{item.goodsCount}}</div>
          </div>
          <div class="flex-x">
            <div class="font-12 color-666 flex-1">{{item.standard}}</div>
            <div class="font-12 price-tag">¥{{item.salePrice}}</div>
          </div>
        </div>
      </div>

      <div class="trackingNum-box">
        <el-form ref="ruleForm" :model="formData" :rules="rules" status-icon>
          <el-form-item prop="deliveryCompany">
            <div>添加物流公司：</div>
            <el-input v-model="formData.deliveryCompany" placeholder="请输入"></el-input>
          </el-form-item>
          <el-form-item prop="trackingNum">
            <div>添加物流单号：</div>
            <el-input v-model="formData.trackingNum" placeholder="请输入"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="changeDialog(false)">取消</el-button>
      <el-button type="primary" @click="confirm" :loading="loading">确认发货</el-button>
    </div>
  </el-dialog>
  <!-- 发货弹窗 end-->
</template>
<script>
import goodsImg from "@src/assets/img/no-data.png";
import defaultImg from "@src/assets/img/myShop/default.png";
import { orderDeliver } from "@src/api/LinkcApi";
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
      defaultImg,
      goodsDialog: false,
      goodsImg,
      formData: {
        trackingNum: "",
        deliveryCompany:""
      },
      loading: false,
      rules: {
        deliveryCompany:[
          { required: true, message: "请输入物流公司", trigger: "blur" },
        ],
        trackingNum: [
          { required: true, message: "请输入物流单号", trigger: "blur" },
        ],
      },
    };
  },
  watch: {
    goodsDialog(val) {
      if (val == false) {
        this.$refs["ruleForm"].resetFields();
      }
    },
  },
  methods: {
    confirm() {
      this.$refs["ruleForm"].validate((valid) => {
        if(!valid) return
        this.loading = true;
        orderDeliver({
          orderId: this.infoData.orderId,
          ...this.formData
        })
          .then((res) => {
            if (res.status == 200) {
              this.changeDialog(false);
              this.$message.success(res.data);
              this.$emit("confirm");
            } else {
              this.$notify.close();
              this.$notify.error({
                title: "网络错误",
                message: res.message,
                duration: 2000,
              });
            }
          })
          .finally(() => {
            this.loading = false;
          });
      });
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

  .trackingNum-box {
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