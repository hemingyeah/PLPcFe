<template>
  <div class="setting-show-cmp-box">
    <div class="wiki-box">
      <div class="flex-x wiki-header">
        <div class="flex-1">企业圈子</div>
        <div class="font-12">
          更多
          <i class="iconfont icon-right font-12"></i>
        </div>
      </div>

      <div class="wiki-info" v-for="(item, index) in dataInfo" :key="index">
        <div class="font-12 mar-b-28 font-w-500">{{item.title}}</div>
        <div class="flex-x font-10">
          <div class="flex-10 flex-1 color-999">{{item.author}}</div>
          <div class="color-999">
            阅读
            <span class="font-12">{{item.num | usual-num}}</span>
          </div>
        </div>
      </div>
      <div class="wiki-info" v-if="dataInfo.length<1">
        <img class="shops-tag-img" :src="tagImg" alt />
        <div class="font-12 mar-b-28 font-w-500">喜讯！售后宝新发布2.0版门户</div>
        <div class="flex-x font-10">
          <div class="flex-10 flex-1 color-999">作者</div>
          <div class="color-999">
            阅读
            <span class="font-12">120</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import _ from "lodash";
import tagImg from "@src/assets/img/myShop/tag.png";

export default {
  name: "wiki-enter",
  props: ["infoData", "cmpId"],
  data() {
    return {
      dataInfo: this.infoData || [],
      tagImg,
    };
  },
  watch: {
    infoData: {
      deep: true,
      handler(value) {
        console.log(value, "22222");
        this.dataInfo = value;
      },
    },
  },
};
</script>
<style lang="scss" scoped>
.setting-show-cmp-box {
  width: 100%;
  //   height: 200px;
  .wiki-box {
    border-radius: 14px;
    overflow: hidden;

    background: #fff;

    .wiki-header {
      background: linear-gradient(
        180deg,
        #dfe6fb 0%,
        rgba(255, 255, 255, 0) 100%
      );
      height: 53px;
      padding: 0 12px;
    }
    .wiki-info {
      position: relative;
      padding: 10px 12px 8px 12px;
      .shops-tag-img {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99;
        width: 30px;
        height: 30px;
      }
    }
  }
  .color-999 {
    color: #999;
  }
}
</style>