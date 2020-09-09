<template>
  <div class="setting-show-cmp-box">
    <div class="company-card-box">
      <div class="flex-x">
        <img class="company-card-img" :src="infoData.imageUrl || ''" />
        <div class="flex-x font-12 font-w-500">
          <div class="overHideCon-1">{{infoData.name}}</div>
        </div>
      </div>
      <div class="company-info">
        <div class="flex-x font-10">
          <div>联系电话：</div>
          <div class="color-gray">{{infoData.phone}}</div>
        </div>
        <div class="flex-x font-10">
          <div>企业地址：</div>
          <div class="color-gray">{{infoData.address}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import userImg from "@src/assets/img/myShop/logo.png";
export default {
  name: "company-card",
  props: {
    infoData: {
      type: Object,
      default: () => {
        return {
          name: "",
          phone: "",
          address: "",
          imageUrl: userImg,
        };
      }, // primary、plain、only-text、ghost、danger
    },
  },
};
</script>

<style lang="scss" scoped>
.setting-show-cmp-box {
  width: 100%;
  background: #fff;
  .company-card-box {
    align-items: flex-start;
    padding: 8px 9px;
    .company-card-img {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      margin-right: 9px;
      overflow: hidden;
    }
    .company-info {
      padding: 8px 13px;
    }
  }
}
.color-gray {
  color: #737f7b;
}
</style>