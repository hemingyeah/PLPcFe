<template>
  <div class="setting-show-cmp-box">
    <div class="company-card-box">
      <div class="flex-x">
        <img
          class="company-card-img"
          :src="
            infoData.logoUrl
              ? `${infoData.logoUrl}?x-oss-process=image/resize,m_fill,h_24,w_24`
              : defaultLogoImg
          "
        />
        <div class="flex-x font-12 font-w-500 flex-1">
          <div class="">{{ infoData.companyName }}</div>
        </div>
      </div>
      <div class="company-info">
        <div class="flex-x font-10 al-start">
          <div>联系电话：</div>
          <div class="color-gray flex-1">{{ infoData.mobile }}</div>
        </div>
        <div class="flex-x font-10 al-start">
          <div>企业地址：</div>
          <div class="color-gray flex-1">{{ infoData.address }}</div>
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
          mobile: "",
          address: "",
          logoUrl: "",
          companyName: "",
        };
      }, // primary、plain、only-text、ghost、danger
    },
  },
  computed: {
    defaultLogoImg() {
      return userImg;
    }
  }
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
      padding: 8px 0 0;
      color: #737f7b;
    }
  }
}
.color-gray {
  color: #737f7b;
}
</style>