<template>
  <div class="setting-show-cmp-box mar-b-32">
    <div class="shops-list-box">
      <div></div>
      <div class="shops-title">
        <div class="font-w-500 flex-1">商城橱窗</div>
        <div class="font-12">
          更多
          <i class="iconfont icon-right font-12"></i>
        </div>
      </div>
      <!-- <draggable class="flex-x flex-w" v-model="dataInfo"> 可拖动-->
      <div class="flex-x flex-w shops-list-box-con">
        <div
          class="flex-x flex-1 shops-list-box-item-box"
          v-for="(item, index) in dataInfo"
          :key="index"
          draggable="draggable"
        >
          <div class="shops-list-item">
            <img
              :src="item.url ? `${item.url}?x-oss-process=image/resize,m_fill,h_165,w_142` : defaultImg"
              class="shops-list-item-img"
            />
            <div class="shops-info">
              <div class="overHideCon-2 mar-b-30 font-12">{{item.name}}</div>
              <div class="flex-x">
                <div class="flex-1 price-tag">
                  <span>¥</span>
                  {{item.price}}
                </div>
                <div>{{item.num | usual-num}}件已售</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- </draggable> -->
      <div class="flex-x" v-if="dataInfo.length < 1">
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
    </div>
  </div>
</template>
<script>
import draggable from "vuedraggable";
import _ from "lodash";
import goodsImg from "@src/assets/img/no-data.png";
import tagImg from "@src/assets/img/myShop/tag.png";
import defaultImg from "@src/assets/img/myShop/default.png";
export default {
  name: "shops-list",
  components: {
    draggable,
  },
  props: ["infoData", "cmpId"],
  data() {
    return {
      dataInfo: [],
      goodsImg,
      tagImg,
      defaultImg,
    };
  },
  watch: {
    infoData: {
      deep: true,
      handler(value) {
        this.dataInfo = value;
      },
    },
  },
  methods: {},
  mounted() {
    this.dataInfo = _.cloneDeep(this.infoData);
  },
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
    align-items: center;
    padding: 0 14px;
  }
  .shops-list-box {
    .shops-list-box-con {
      width: 100%;
      position: relative;
      .shops-list-box-item-box {
        &:nth-child(even) {
          justify-content: flex-end;
        }
      }
    }
    .shops-list-item {
      // &:nth-child(even) {
      //   margin-left: 3px;
      // }
      display: flex;
      flex-direction: column;
      margin-bottom: 5px;
      position: relative;
      border-radius: 2px;
      overflow: hidden;
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