<template>
  <div class="setting-show-cmp-box">
    <div class>
      <div class="shops-title">商城橱窗</div>
      <draggable class="shops-list-box flex-x flex-w" v-model="dataInfo">
        <div
          class="can-move flex-x"
          v-for="(item, index) in dataInfo"
          :key="index"
          draggable="true"
        >
          <div class="shops-list-item">
            <img src class="shops-list-item-img" />
            <div class="shops-info">
              <div class="overHideCon-2 mar-b-30 font-12">示例商品</div>
              <div class="flex-x">
                <div class="flex-1">
                  <span>¥</span>66.66
                </div>
                <div>3.5万件已售</div>
              </div>
            </div>
          </div>
        </div>

        <div class="can-move flex-x" v-if="dataInfo.length < 1">
          <div class="shops-list-item">
            <img class="shops-tag-img" :src="tagImg" alt />
            <img :src="goodsImg" class="shops-list-item-img" />
            <div class="shops-info">
              <div class="overHideCon-2 mar-b-30 font-12">示例商品</div>
              <div class="flex-x">
                <div class="flex-1 price-tag">
                  <span class="font-12">¥</span>
                  <span class="font-15">66.66</span>
                </div>
                <div class="font-12">3.5万件已售</div>
              </div>
            </div>
          </div>
        </div>
      </draggable>
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import _ from "lodash";
import goodsImg from "@src/assets/img/no-data.png";
import tagImg from "@src/assets/img/myShop/tag.png";
export default {
  name: "shops-list",
  components: {
    draggable,
  },
  props: ["infoData", "cmpId"],
  data() {
    return {
      dataInfo: this.infoData || [],
      goodsImg,
      tagImg,
    };
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
.setting-show-cmp-box {
  width: 100%;

  background: linear-gradient(180deg, #d2faea 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 13px;
  .shops-title {
    height: 57px;
    display: flex;
    flex-wrap: wrap;
    font-weight: 500;
    align-items: center;
    padding: 0 14px;
  }
  .shops-list-box {
    .shops-list-item {
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;
      position: relative;
      .shops-tag-img {
        position: absolute;
        left: 0;
        top: 0;
        z-index: 99;
        width: 30px;
        height: 30px;
      }
      .shops-list-item-img {
        width: 165.5px;
        height: 142px;
      }
      .shops-info {
        display: flex;
        background: #fff;
        flex-direction: column;
        justify-content: space-between;
        height: 77px;
        box-sizing: border-box;
        padding: 7px;
        .price-tag {
          color: #fb602c;
        }
      }
    }
    .can-move {
      width: 50%;
      justify-content: flex-end;
    }
    .can-move:nth-child(2n + 1) {
      width: 50%;
      justify-content: flex-start;
    }
  }
}
</style>